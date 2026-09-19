from dataclasses import dataclass
from datetime import datetime
from statistics import mean

from app.models.entities import Transaction


@dataclass
class FraudAnalysis:
    score: int
    level: str
    reasons: list[str]


def analyze_transaction(transaction: Transaction, history: list[Transaction]) -> FraudAnalysis:
    score = 0
    reasons: list[str] = []
    prior = [item for item in history if item.transaction_id != transaction.transaction_id]

    if prior:
        average_amount = mean(item.amount for item in prior)
        if transaction.amount >= average_amount * 5:
            score += 35
            reasons.append("Transaction amount significantly differs from customer's normal activity")
        elif transaction.amount >= average_amount * 2.5:
            score += 20
            reasons.append("Transaction amount is unusually high for this customer")
        elif transaction.amount >= average_amount * 1.5:
            score += 10
            reasons.append("Transaction amount is above the customer's usual range")

        known_senders = {item.sender.casefold() for item in prior}
        if transaction.sender.casefold() not in known_senders or transaction.sender.casefold() in {"unknown", "unavailable"}:
            score += 20
            reasons.append("Sender is unfamiliar")

        known_locations = {item.location.casefold() for item in prior}
        if transaction.location.casefold() not in known_locations:
            score += 10
            reasons.append("Transaction location differs from historical activity")

        known_devices = {item.device.casefold() for item in prior}
        if transaction.device.casefold() not in known_devices or transaction.device.casefold() in {"unknown", "unavailable"}:
            score += 10
            reasons.append("Transaction uses an unfamiliar device")
    else:
        if transaction.sender.casefold() in {"unknown", "unavailable"}:
            score += 20
            reasons.append("Sender is unfamiliar")

    if transaction.timestamp.hour < 6 or transaction.timestamp.hour >= 23:
        score += 20
        reasons.append("Transaction occurred at an unusual time")

    if prior and transaction.amount >= mean(item.amount for item in prior) * 2.5 and len(reasons) > 1:
        reasons.append("Transaction differs from historical behavior")

    score = min(score, 100)
    level = "HIGH" if score >= 61 else "MEDIUM" if score >= 31 else "LOW"
    if not reasons:
        reasons.append("Transaction matches the customer's observed historical pattern")
    return FraudAnalysis(score=score, level=level, reasons=reasons)
