from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def new_id() -> str:
    return str(uuid4())


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    customer_id: Mapped[str] = mapped_column(String(100), index=True)
    sender: Mapped[str] = mapped_column(String(200))
    receiver: Mapped[str] = mapped_column(String(200))
    amount: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    location: Mapped[str] = mapped_column(String(200))
    device: Mapped[str] = mapped_column(String(200))
    merchant: Mapped[str] = mapped_column(String(200))
    transaction_type: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), default="COMPLETED")
    risk_score: Mapped[int] = mapped_column(Integer, default=0)
    risk_level: Mapped[str] = mapped_column(String(20), default="LOW")
    risk_reasons: Mapped[list[str]] = mapped_column(JSON, default=list)
    risk_factors: Mapped[list[dict]] = mapped_column(JSON, default=list)
    investigation_action: Mapped[str | None] = mapped_column(String(40), nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    alert_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    transaction_id: Mapped[str] = mapped_column(String(36), index=True, unique=True)
    customer_id: Mapped[str] = mapped_column(String(100), index=True)
    risk_score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(20))
    reasons: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(30), default="NEW")
    investigator_action: Mapped[str | None] = mapped_column(String(40), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class CustomerVerification(Base):
    __tablename__ = "customer_verifications"

    verification_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    alert_id: Mapped[str] = mapped_column(String(36), index=True)
    customer_id: Mapped[str] = mapped_column(String(100), index=True)
    transaction_id: Mapped[str] = mapped_column(String(36), index=True)
    status: Mapped[str] = mapped_column(String(30), default="PENDING")
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    customer_response: Mapped[str | None] = mapped_column(String(40), nullable=True)


class InvestigationEvent(Base):
    __tablename__ = "investigation_events"

    event_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    alert_id: Mapped[str] = mapped_column(String(36), index=True)
    event_type: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text)
    investigator: Mapped[str] = mapped_column(String(100), default="Bank Investigator")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class InvestigatorNote(Base):
    __tablename__ = "investigator_notes"

    note_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    alert_id: Mapped[str] = mapped_column(String(36), index=True)
    content: Mapped[str] = mapped_column(Text)
    investigator: Mapped[str] = mapped_column(String(100), default="Bank Investigator")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
