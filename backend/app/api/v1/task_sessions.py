import uuid
import os
import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.task_session import TaskSession, SessionStatus
from app.models.application import Application, ApplicationStatus
from app.models.task import Task
from app.schemas.task_session import CheckInRequest, TaskSessionResponse, EarningsResponse
from app.core.deps import get_current_user
from app.models.user import User
from app.models.wallet import Wallet, Transaction, TransactionType
from app.config import get_settings

router = APIRouter(prefix="/task-sessions", tags=["Task Tracking"])
settings = get_settings()


@router.post("/checkin", response_model=TaskSessionResponse, status_code=status.HTTP_201_CREATED)
async def check_in(
    payload: CheckInRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Worker checks in to begin a task. Application must be approved."""
    # Verify application belongs to this worker and is approved
    result = await db.execute(
        select(Application).where(
            Application.id == payload.application_id,
            Application.worker_id == current_user.id,
            Application.status == ApplicationStatus.APPROVED,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approved application not found for this worker",
        )

    # Prevent double check-in
    existing = await db.execute(
        select(TaskSession).where(
            TaskSession.application_id == payload.application_id,
            TaskSession.status == SessionStatus.ACTIVE,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already checked in for this application",
        )

    session = TaskSession(
        task_id=application.task_id,
        worker_id=current_user.id,
        application_id=payload.application_id,
    )
    db.add(session)
    await db.flush()
    return TaskSessionResponse.model_validate(session)


@router.post("/{session_id}/checkout", response_model=TaskSessionResponse)
async def check_out(
    session_id: uuid.UUID,
    proof_notes: str | None = Form(default=None),
    proof_photo: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Worker checks out, optionally submitting a proof photo and notes."""
    result = await db.execute(
        select(TaskSession).where(
            TaskSession.id == session_id,
            TaskSession.worker_id == current_user.id,
            TaskSession.status == SessionStatus.ACTIVE,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active session not found")

    # Fetch task for pay rate
    task_result = await db.execute(select(Task).where(Task.id == session.task_id))
    task = task_result.scalar_one()

    now = datetime.now(timezone.utc)
    elapsed_minutes = (now - session.checked_in_at.replace(tzinfo=timezone.utc)).total_seconds() / 60
    earnings = round(elapsed_minutes * task.pay_rate_per_minute, 2)

    # Save proof photo if provided
    photo_url = None
    if proof_photo and proof_photo.filename:
        ext = os.path.splitext(proof_photo.filename)[1].lower()
        allowed_ext = {".jpg", ".jpeg", ".png", ".webp"}
        if ext not in allowed_ext:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid image type")
        size = 0
        filename = f"proof_{session_id}{ext}"
        save_path = os.path.join(settings.MEDIA_DIR, filename)
        os.makedirs(settings.MEDIA_DIR, exist_ok=True)
        with open(save_path, "wb") as f:
            while chunk := await proof_photo.read(1024 * 64):
                size += len(chunk)
                if size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
                f.write(chunk)
        photo_url = f"/media/{filename}"

    session.checked_out_at = now
    session.earnings = earnings
    session.status = SessionStatus.COMPLETED
    session.proof_notes = proof_notes
    if photo_url:
        session.proof_photo_url = photo_url

    # ── Credit earnings to wallet ─────────────────────────────────────────────
    wallet_result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = wallet_result.scalar_one_or_none()
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        await db.flush()
    wallet.available_balance = round(wallet.available_balance + earnings, 2)
    txn = Transaction(
        user_id=current_user.id,
        type=TransactionType.CREDIT,
        amount=earnings,
        description=f"Earnings from task: {task.title}",
        reference_id=str(session.id),
    )
    db.add(txn)
    # ──────────────────────────────────────────────────────────────────────────

    await db.flush()
    return TaskSessionResponse.model_validate(session)


@router.get("/{session_id}/earnings", response_model=EarningsResponse)
async def get_earnings(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get real-time earnings for an active session."""
    result = await db.execute(
        select(TaskSession).where(
            TaskSession.id == session_id,
            TaskSession.worker_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    task_result = await db.execute(select(Task).where(Task.id == session.task_id))
    task = task_result.scalar_one()

    now = datetime.now(timezone.utc)
    ref_time = session.checked_out_at or now
    elapsed_minutes = (ref_time.replace(tzinfo=timezone.utc) - session.checked_in_at.replace(tzinfo=timezone.utc)).total_seconds() / 60
    current_earnings = session.earnings if session.status == SessionStatus.COMPLETED else round(elapsed_minutes * task.pay_rate_per_minute, 2)

    return EarningsResponse(
        session_id=session.id,
        checked_in_at=session.checked_in_at,
        elapsed_minutes=round(elapsed_minutes, 2),
        pay_rate_per_minute=task.pay_rate_per_minute,
        current_earnings=current_earnings,
        status=session.status,
    )


@router.get("/my", response_model=list[TaskSessionResponse])
async def my_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all task sessions for the current worker."""
    result = await db.execute(
        select(TaskSession)
        .where(TaskSession.worker_id == current_user.id)
        .order_by(TaskSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return [TaskSessionResponse.model_validate(s) for s in sessions]


@router.get("/active", response_model=TaskSessionResponse | None)
async def get_active_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current worker's active session, if any."""
    result = await db.execute(
        select(TaskSession).where(
            TaskSession.worker_id == current_user.id,
            TaskSession.status == SessionStatus.ACTIVE,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return None
    return TaskSessionResponse.model_validate(session)
