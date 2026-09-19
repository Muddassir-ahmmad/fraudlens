from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models.entities import Transaction
from app.schemas.api import TransactionCreate
from app.services.transactions import create_transaction, parse_seed_time


def seed_database(db: Session) -> None:
    Base.metadata.create_all(bind=engine)
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
        ("CUST004", "Aarav Mehta", "Aisha Khan", 3200, "2026-09-14T09:20:00", "Pune", "Aisha-Pixel", "City Market", "DEBIT"),
        ("CUST004", "Aisha Khan", "Aisha Khan", 7800, "2026-09-17T18:10:00", "Pune", "Aisha-Pixel", "Travel Desk", "DEBIT"),
        ("CUST005", "Daniel Brooks", "Mateo Silva", 5400, "2026-09-15T12:40:00", "Hyderabad", "Mateo-Galaxy", "Fresh Basket", "DEBIT"),
        ("CUST005", "Daniel Brooks", "Mateo Silva", 9200, "2026-09-18T15:25:00", "Hyderabad", "Mateo-Galaxy", "Home Supplies", "DEBIT"),
        ("CUST006", "Kavya Nair", "Kavya Nair", 12500, "2026-09-16T10:05:00", "Chennai", "Kavya-iPhone", "Studio Works", "CREDIT"),
        ("CUST006", "Kavya Nair", "Kavya Nair", 6800, "2026-09-19T11:15:00", "Chennai", "Kavya-iPhone", "Studio Works", "CREDIT"),
        ("CUST007", "Noah Wilson", "Daniel Reed", 4100, "2026-09-17T08:45:00", "Kolkata", "Daniel-Android", "Metro Foods", "DEBIT"),
        ("CUST007", "Noah Wilson", "Daniel Reed", 11600, "2026-09-19T14:10:00", "Kolkata", "Daniel-Android", "Electronics Point", "DEBIT"),
    ]
    for row in seed_rows:
        customer_id, sender, receiver, amount, timestamp, location, device, merchant, transaction_type = row
        parsed_timestamp = parse_seed_time(timestamp)
        if db.scalar(
            select(Transaction.transaction_id).where(
                Transaction.customer_id == customer_id,
                Transaction.timestamp == parsed_timestamp,
            )
        ):
            continue
        create_transaction(
            db,
            TransactionCreate(
                customer_id=customer_id,
                sender=sender,
                receiver=receiver,
                amount=amount,
                timestamp=parsed_timestamp,
                location=location,
                device=device,
                merchant=merchant,
                transaction_type=transaction_type,
            ),
        )
