from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Alert, Transaction
from app.schemas.api import AlertAction, AlertResponse, AlertUpdate

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


def get_alert_or_404(db: Session, alert_id: str) -> Alert:
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("", response_model=list[AlertResponse])
def list_alerts(status: str | None = None, db: Session = Depends(get_db)):
    query = select(Alert).order_by(desc(Alert.created_at))
    if status:
        query = query.where(Alert.status == status)
    return list(db.scalars(query))


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    return get_alert_or_404(db, alert_id)


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: str, payload: AlertUpdate, db: Session = Depends(get_db)):
    alert = get_alert_or_404(db, alert_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/action", response_model=AlertResponse)
def record_action(alert_id: str, payload: AlertAction, db: Session = Depends(get_db)):
    alert = get_alert_or_404(db, alert_id)
    alert.investigator_action = payload.action
    alert.notes = payload.notes
    if payload.action == "UNDER_REVIEW":
        alert.status = "UNDER_REVIEW"
    elif payload.action in {"ALLOW", "SIMULATED_RESTRICTION", "REQUEST_VERIFICATION"}:
        alert.status = "RESOLVED"

    transaction = db.scalar(select(Transaction).where(Transaction.transaction_id == alert.transaction_id))
    if transaction:
        transaction.investigation_action = payload.action
    db.commit()
    db.refresh(alert)
    return alert
