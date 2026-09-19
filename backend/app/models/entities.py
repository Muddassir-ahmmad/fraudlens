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
