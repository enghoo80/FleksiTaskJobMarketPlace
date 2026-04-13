import os
import uuid
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, FCMTokenUpdate
from app.core.deps import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/users", tags=["Users"])
settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = json.dumps(update_data["skills"])
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.add(current_user)
    return current_user


@router.post("/me/photo", response_model=UserResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, and WebP images are allowed")

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    media_path = Path(settings.MEDIA_DIR) / "profiles"
    media_path.mkdir(parents=True, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{current_user.id}.{ext}"
    file_path = media_path / filename

    with open(file_path, "wb") as f:
        f.write(content)

    current_user.profile_photo_url = f"/media/profiles/{filename}"
    db.add(current_user)
    return current_user


@router.put("/me/fcm-token", status_code=status.HTTP_204_NO_CONTENT)
async def update_fcm_token(
    payload: FCMTokenUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.fcm_token = payload.fcm_token
    db.add(current_user)
