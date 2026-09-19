from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Transaction
from app.schemas.api import PaymentRequest, PaymentResponse, TimelineEvent, TransactionCreate, TransactionResponse
from app.services.transactions import create_transaction

router = APIRouter(prefix="/api/transactions", tags=["transactions"])
customer_router = APIRouter(prefix="/api/customers", tags=["customers"])


def get_transaction_or_404(db: Session, transaction_id: str) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    customer_id: str | None = None,
    risk_level: str | None = Query(default=None, pattern="^(LOW|MEDIUM|HIGH)$"),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = select(Transaction).order_by(desc(Transaction.timestamp)).limit(limit)
    if customer_id:
        query = query.where(Transaction.customer_id == customer_id)
    if risk_level:
        query = query.where(Transaction.risk_level == risk_level)
    return list(db.scalars(query))


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    return get_transaction_or_404(db, transaction_id)


@router.post("/simulate", response_model=TransactionResponse, status_code=201)
def simulate_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(db, payload)

@router.post("/pay", response_model=PaymentResponse, status_code=201)
def pay_transaction(payload: PaymentRequest, db: Session = Depends(get_db)):
    history = list(db.scalars(
        select(Transaction)
        .where(Transaction.customer_id == payload.customer_id)
        .order_by(Transaction.timestamp)
    ))
    if not history:
        raise HTTPException(status_code=404, detail="Customer not found")

    baseline = history[-1]
    payment = TransactionCreate(
        customer_id=payload.customer_id,
        sender=baseline.receiver,
        receiver=payload.recipient,
        amount=payload.amount,
        timestamp=payload.timestamp or datetime.now(),
        location=baseline.location,
        device=baseline.device,
        merchant="FraudLens Demo Payments",
        transaction_type="DEBIT",
    )
    transaction = create_transaction(db, payment, recipient_type=payload.recipient_type)
    alert_created = transaction.risk_level == "HIGH"
    return PaymentResponse(
        transaction_id=transaction.transaction_id,
        customer_id=transaction.customer_id,
        recipient=transaction.receiver,
        amount=transaction.amount,
        risk_score=transaction.risk_score,
        risk_level=transaction.risk_level,
        risk_reasons=transaction.risk_reasons,
        risk_factors=transaction.risk_factors or [],
        status=transaction.status,
        alert_created=alert_created,
    )


@customer_router.get("/{customer_id}/transactions", response_model=list[TransactionResponse])
def customer_transactions(customer_id: str, db: Session = Depends(get_db)):
    query = select(Transaction).where(Transaction.customer_id == customer_id).order_by(Transaction.timestamp)
    return list(db.scalars(query))


@customer_router.get("/{customer_id}/timeline", response_model=list[TimelineEvent])
def customer_timeline(customer_id: str, db: Session = Depends(get_db)):
    query = select(Transaction).where(Transaction.customer_id == customer_id).order_by(Transaction.timestamp)
    return list(db.scalars(query))
