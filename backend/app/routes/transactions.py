from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Transaction
from app.schemas.api import TimelineEvent, TransactionCreate, TransactionResponse
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


@customer_router.get("/{customer_id}/transactions", response_model=list[TransactionResponse])
def customer_transactions(customer_id: str, db: Session = Depends(get_db)):
    query = select(Transaction).where(Transaction.customer_id == customer_id).order_by(Transaction.timestamp)
    return list(db.scalars(query))


@customer_router.get("/{customer_id}/timeline", response_model=list[TimelineEvent])
def customer_timeline(customer_id: str, db: Session = Depends(get_db)):
    query = select(Transaction).where(Transaction.customer_id == customer_id).order_by(Transaction.timestamp)
    return list(db.scalars(query))
