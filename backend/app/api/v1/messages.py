import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.message import Message
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


class MessageCreate(BaseModel):
    recipient_id: uuid.UUID
    body: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    recipient_id: uuid.UUID
    sender_name: str | None = None
    body: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.body.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message body cannot be empty")
    recipient = await db.execute(select(User).where(User.id == payload.recipient_id))
    if not recipient.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

    msg = Message(sender_id=current_user.id, recipient_id=payload.recipient_id, body=payload.body.strip())
    db.add(msg)
    await db.flush()
    resp = MessageResponse.model_validate(msg)
    resp.sender_name = current_user.full_name
    return resp


@router.get("/conversation/{user_id}", response_model=list[MessageResponse])
async def get_conversation(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all messages between current user and a specific user."""
    result = await db.execute(
        select(Message).where(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
                and_(Message.sender_id == user_id, Message.recipient_id == current_user.id),
            )
        ).order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    # Mark as read
    for msg in messages:
        if msg.recipient_id == current_user.id and not msg.is_read:
            msg.is_read = True
    await db.flush()

    out = []
    for msg in messages:
        sender_result = await db.execute(select(User).where(User.id == msg.sender_id))
        sender = sender_result.scalar_one_or_none()
        resp = MessageResponse.model_validate(msg)
        resp.sender_name = sender.full_name if sender else "Unknown"
        out.append(resp)
    return out


@router.get("/unread-count")
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func
    result = await db.execute(
        select(func.count()).select_from(Message).where(
            Message.recipient_id == current_user.id,
            Message.is_read == False,  # noqa: E712
        )
    )
    return {"count": result.scalar_one()}
