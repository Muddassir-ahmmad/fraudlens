from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]
AlertStatus = Literal["NEW", "UNDER_REVIEW", "RESOLVED"]
InvestigationAction = Literal["ALLOW", "REQUEST_VERIFICATION", "UNDER_REVIEW", "SIMULATED_RESTRICTION"]


class RiskFactor(BaseModel):
    name: str
    score: int
    reason: str


class TransactionCreate(BaseModel):
    customer_id: str = Field(min_length=1)
    sender: str
    receiver: str
    amount: float = Field(gt=0)
    timestamp: datetime
    location: str
    device: str
    merchant: str
    transaction_type: str = "CREDIT"


class TransactionResponse(TransactionCreate):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: str
    status: str
    risk_score: int
    risk_level: RiskLevel
    risk_reasons: list[str]
    risk_factors: list[RiskFactor] = Field(default_factory=list)
    investigation_action: str | None


class PaymentRequest(BaseModel):
    customer_id: str = Field(min_length=1)
    recipient: str = Field(min_length=1)
    amount: float = Field(gt=0)
    recipient_type: Literal["KNOWN", "UNKNOWN"] = "KNOWN"
    timestamp: datetime | None = None


class PaymentResponse(BaseModel):
    transaction_id: str
    customer_id: str
    recipient: str
    amount: float
    risk_score: int
    risk_level: RiskLevel
    risk_reasons: list[str]
    risk_factors: list[RiskFactor]
    status: str
    alert_created: bool


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    alert_id: str
    transaction_id: str
    customer_id: str
    risk_score: int
    risk_level: RiskLevel
    reasons: list[str]
    created_at: datetime
    status: AlertStatus
    investigator_action: str | None
    notes: str | None


class AlertUpdate(BaseModel):
    status: AlertStatus | None = None
    notes: str | None = None


class AlertAction(BaseModel):
    action: InvestigationAction
    notes: str | None = None


VerificationResponseValue = Literal["PAYMENT_VALID", "PAYMENT_NOT_AUTHORIZED", "CUSTOMER_NEEDS_HELP"]


class VerificationRequestResponse(BaseModel):
    verification_id: str
    alert_id: str
    customer_id: str
    customer_name: str
    transaction_id: str
    status: str
    requested_at: datetime
    responded_at: datetime | None
    customer_response: VerificationResponseValue | None
    amount: float
    recipient: str
    risk_level: RiskLevel


class VerificationResponseRequest(BaseModel):
    response: VerificationResponseValue


class InvestigationEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: str
    alert_id: str
    event_type: str
    description: str
    investigator: str
    created_at: datetime


class InvestigatorNoteCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    investigator: str = "Bank Investigator"


class InvestigatorNoteResponse(InvestigatorNoteCreate):
    model_config = ConfigDict(from_attributes=True)

    note_id: str
    alert_id: str
    created_at: datetime


class DashboardSummary(BaseModel):
    total_transactions: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    new_alerts: int
    transactions_under_investigation: int
    recently_flagged: list[TransactionResponse]


class TimelineEvent(BaseModel):
    transaction_id: str
    timestamp: datetime
    amount: float
    transaction_type: str
    risk_score: int
    risk_level: RiskLevel
    risk_reasons: list[str]
    status: str
