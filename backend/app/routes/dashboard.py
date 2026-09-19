from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Alert, Transaction
from app.schemas.api import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(Transaction)) or 0
    counts = {
        level: db.scalar(select(func.count()).select_from(Transaction).where(Transaction.risk_level == level)) or 0
        for level in ("LOW", "MEDIUM", "HIGH")
    }
    new_alerts = db.scalar(select(func.count()).select_from(Alert).where(Alert.status == "NEW")) or 0
    under_investigation = db.scalar(
        select(func.count()).select_from(Alert).where(Alert.status == "UNDER_REVIEW")
    ) or 0
    recent = list(
        db.scalars(
            select(Transaction)
            .where(Transaction.risk_level.in_(["MEDIUM", "HIGH"]))
            .order_by(Transaction.timestamp.desc())
            .limit(10)
        )
    )
    return DashboardSummary(
        total_transactions=total,
        low_risk_count=counts["LOW"],
        medium_risk_count=counts["MEDIUM"],
        high_risk_count=counts["HIGH"],
        new_alerts=new_alerts,
        transactions_under_investigation=under_investigation,
        recently_flagged=recent,
    )
