import uuid
from datetime import datetime
from pydantic import BaseModel


class WalletResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    available_balance: float
    pending_balance: float  # computed from active sessions
    updated_at: datetime

    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    id: uuid.UUID
    type: str
    amount: float
    description: str
    reference_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BankAccountRequest(BaseModel):
    bank_name: str
    account_number: str
    account_holder_name: str


class BankAccountResponse(BaseModel):
    id: uuid.UUID
    bank_name: str
    account_number: str         # masked on read
    account_holder_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WithdrawalRequestCreate(BaseModel):
    amount: float


class WithdrawalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    amount: float
    status: str
    bank_name: str
    account_number: str
    account_holder_name: str
    admin_notes: str | None
    processed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
