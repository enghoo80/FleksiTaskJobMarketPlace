import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
import json


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    bio: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    skills: list[str] | None = None

    @field_validator("skills", mode="before")
    @classmethod
    def parse_skills(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class UserCreate(UserBase):
    password: str | None = None
    google_id: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    skills: list[str] | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    profile_photo_url: str | None = None
    is_active: bool
    is_employer: bool
    is_admin: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    id: uuid.UUID
    full_name: str
    profile_photo_url: str | None = None
    location: str | None = None
    skills: list[str] | None = None

    model_config = {"from_attributes": True}


class FCMTokenUpdate(BaseModel):
    fcm_token: str
