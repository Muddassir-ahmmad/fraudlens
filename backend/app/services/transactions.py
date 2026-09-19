from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.fraud.engine import analyze_transaction
from app.models.entities import Alert, InvestigationEvent, Transaction
from app.schemas.api import TransactionCreate

ALERT_THRESHOLD = 61


def create_transaction(
    db: Session,
    payload: TransactionCreate,
    recipient_type: str | None = None,
) -> Transaction:
    transaction = Transaction(**payload.model_dump(), status="COMPLETED")
    history = list(
        db.scalars(
            select(Transaction)
            .where(Transaction.customer_id == payload.customer_id)
            .order_by(Transaction.timestamp)
        )
    )
    analysis = analyze_transaction(transaction, history, recipient_type=recipient_type)
    transaction.risk_score = analysis.score
    transaction.risk_level = analysis.level
    transaction.risk_reasons = analysis.reasons
    transaction.risk_factors = analysis.factors
    transaction.status = "REQUIRES_REVIEW" if transaction.risk_level == "HIGH" else "COMPLETED"
    db.add(transaction)
    db.flush()

    if transaction.risk_score >= ALERT_THRESHOLD:
        db.add(
            Alert(
                transaction_id=transaction.transaction_id,
                customer_id=transaction.customer_id,
                risk_score=transaction.risk_score,
                risk_level=transaction.risk_level,
                reasons=transaction.risk_reasons,
            )
        )
        db.flush()
        alert = db.scalar(select(Alert).where(Alert.transaction_id == transaction.transaction_id))
        if alert:
            db.add(InvestigationEvent(
                alert_id=alert.alert_id,
                event_type="ALERT_CREATED",
                description="High-risk transaction alert created",
            ))
    db.commit()
    db.refresh(transaction)
    return transaction


def parse_seed_time(value: str) -> datetime:
    return datetime.fromisoformat(value)
