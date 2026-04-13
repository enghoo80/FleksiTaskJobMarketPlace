import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.application import ApplicationStatus
from app.schemas.task import TaskResponse
from app.schemas.user import UserPublic


class ApplicationCreate(BaseModel):
    task_id: uuid.UUID
    cover_note: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    worker_id: uuid.UUID
    cover_note: str | None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationWithDetails(ApplicationResponse):
    task: TaskResponse | None = None
    worker: UserPublic | None = None
