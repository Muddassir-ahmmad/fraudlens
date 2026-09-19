from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models.entities import Transaction
from app.schemas.api import TransactionCreate
from app.services.transactions import create_transaction, parse_seed_time


def seed_database(db: Session) -> None:
    Base.metadata.create_all(bind=engine)
    if db.scalar(select(Transaction.transaction_id).limit(1)):
        return

    seed_rows = [
        ("CUST001", "Employer Payroll", "Rahul", 2500, "2026-09-10T10:15:00", "Bengaluru", "Rahul-iPhone", "Acme Payroll", "CREDIT"),
        ("CUST001", "Neha", "Rahul", 6000, "2026-09-11T14:20:00", "Bengaluru", "Rahul-iPhone", "UPI Transfer", "CREDIT"),
        ("CUST001", "Vikram", "Rahul", 4500, "2026-09-13T11:05:00", "Bengaluru", "Rahul-iPhone", "UPI Transfer", "CREDIT"),
        ("CUST001", "Employer Payroll", "Rahul", 8000, "2026-09-15T09:00:00", "Bengaluru", "Rahul-iPhone", "Acme Payroll", "CREDIT"),
        ("CUST001", "Anita", "Rahul", 5000, "2026-09-17T16:40:00", "Bengaluru", "Rahul-iPhone", "UPI Transfer", "CREDIT"),
        ("CUST001", "UNKNOWN", "Rahul", 500000, "2026-09-19T02:30:00", "Bengaluru", "unknown", "Unknown Merchant", "CREDIT"),
        ("CUST002", "Rahul", "Priya", 1200, "2026-09-18T13:00:00", "Mumbai", "Priya-Android", "Retail Store", "DEBIT"),
        ("CUST002", "Rahul", "Priya", 1800, "2026-09-19T12:30:00", "Mumbai", "Priya-Android", "Grocery Hub", "DEBIT"),
        ("CUST003", "Client A", "Arjun", 15000, "2026-09-18T11:45:00", "Delhi", "Arjun-Laptop", "Consulting Fee", "CREDIT"),
    ]
    for row in seed_rows:
        customer_id, sender, receiver, amount, timestamp, location, device, merchant, transaction_type = row
        create_transaction(
            db,
            TransactionCreate(
                customer_id=customer_id,
                sender=sender,
                receiver=receiver,
                amount=amount,
                timestamp=parse_seed_time(timestamp),
                location=location,
                device=device,
                merchant=merchant,
                transaction_type=transaction_type,
            ),
        )
