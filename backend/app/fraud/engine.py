from dataclasses import dataclass
from datetime import datetime
from statistics import mean

from app.models.entities import Transaction


@dataclass
class FraudAnalysis:
    score: int
    level: str
    reasons: list[str]
    factors: list[dict]


def analyze_transaction(
    transaction: Transaction,
    history: list[Transaction],
    recipient_type: str | None = None,
) -> FraudAnalysis:
    score = 0
    reasons: list[str] = []
    factors: list[dict] = []
    prior = [
        item
        for item in history
        if item.transaction_id != transaction.transaction_id and item.risk_level == "LOW"
    ]

    if prior:
        average_amount = mean(item.amount for item in prior)
        if transaction.amount >= average_amount * 5:
            score += 35
            reason = "Transaction amount significantly differs from customer's normal activity"
            reasons.append(reason)
            factors.append({"name": "Amount anomaly", "score": 35, "reason": reason})
        elif transaction.amount >= average_amount * 2.5:
            score += 20
            reason = "Transaction amount is unusually high for this customer"
            reasons.append(reason)
            factors.append({"name": "Amount anomaly", "score": 20, "reason": reason})
        elif transaction.amount >= average_amount * 1.5:
            score += 10
            reason = "Transaction amount is above the customer's usual range"
            reasons.append(reason)
            factors.append({"name": "Amount anomaly", "score": 10, "reason": reason})

        if recipient_type == "UNKNOWN":
            score += 15
            reason = "Recipient is new or unfamiliar"
            reasons.append(reason)
            factors.append({"name": "Recipient familiarity", "score": 15, "reason": reason})
        elif recipient_type is None:
            known_senders = {item.sender.casefold() for item in prior}
            if transaction.sender.casefold() not in known_senders or transaction.sender.casefold() in {"unknown", "unavailable"}:
                score += 20
                reason = "Sender is unfamiliar"
                reasons.append(reason)
                factors.append({"name": "Unknown sender", "score": 20, "reason": reason})

        known_locations = {item.location.casefold() for item in prior}
        if transaction.location.casefold() not in known_locations:
            score += 10
            reason = "Transaction location differs from historical activity"
            reasons.append(reason)
            factors.append({"name": "Location anomaly", "score": 10, "reason": reason})

        known_devices = {item.device.casefold() for item in prior}
        if transaction.device.casefold() not in known_devices or transaction.device.casefold() in {"unknown", "unavailable"}:
            score += 10
            reason = "Transaction uses an unfamiliar device"
            reasons.append(reason)
            factors.append({"name": "Unknown device", "score": 10, "reason": reason})
    else:
        if transaction.sender.casefold() in {"unknown", "unavailable"}:
            score += 20
            reason = "Sender is unfamiliar"
            reasons.append(reason)
            factors.append({"name": "Unknown sender", "score": 20, "reason": reason})

    if transaction.timestamp.hour < 6 or transaction.timestamp.hour >= 23:
        score += 20
        reason = "Transaction occurred at an unusual time"
        reasons.append(reason)
        factors.append({"name": "Unusual time", "score": 20, "reason": reason})

    if prior and transaction.amount >= mean(item.amount for item in prior) * 2.5 and len(reasons) > 1:
        reasons.append("Transaction differs from historical behavior")

    score = min(score, 100)
    level = "HIGH" if score >= 61 else "MEDIUM" if score >= 31 else "LOW"
    if not reasons:
        reasons.append("Transaction matches the customer's observed historical pattern")
    return FraudAnalysis(score=score, level=level, reasons=reasons, factors=factors)
