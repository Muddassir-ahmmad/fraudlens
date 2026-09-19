from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Alert, CustomerVerification, InvestigationEvent, InvestigatorNote, Transaction
from app.schemas.api import (
    AlertAction,
    AlertResponse,
    AlertUpdate,
    InvestigationEventResponse,
    InvestigatorNoteCreate,
    InvestigatorNoteResponse,
    VerificationRequestResponse,
    VerificationResponseRequest,
)

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
    db.add(InvestigationEvent(
        alert_id=alert_id,
        event_type="ACTION_RECORDED",
        description=f"Investigator action recorded: {payload.action}",
    ))
    db.commit()
    db.refresh(alert)
    return alert


def verification_payload(db: Session, verification: CustomerVerification) -> dict:
    transaction = db.get(Transaction, verification.transaction_id)
    alert = db.get(Alert, verification.alert_id)
    return {
        "verification_id": verification.verification_id,
        "alert_id": verification.alert_id,
        "customer_id": verification.customer_id,
        "customer_name": transaction.receiver if transaction else verification.customer_id,
        "transaction_id": verification.transaction_id,
        "status": verification.status,
        "requested_at": verification.requested_at,
        "responded_at": verification.responded_at,
        "customer_response": verification.customer_response,
        "amount": transaction.amount if transaction else 0,
        "recipient": transaction.receiver if transaction else "Unknown recipient",
        "risk_level": alert.risk_level if alert else "HIGH",
    }


@router.post("/{alert_id}/verification-request", response_model=VerificationRequestResponse, status_code=201)
def request_verification(alert_id: str, db: Session = Depends(get_db)):
    alert = get_alert_or_404(db, alert_id)
    existing = db.scalar(
        select(CustomerVerification).where(
            CustomerVerification.alert_id == alert_id,
            CustomerVerification.status == "PENDING",
        )
    )
    if existing:
        return verification_payload(db, existing)

    verification = CustomerVerification(
        alert_id=alert.alert_id,
        customer_id=alert.customer_id,
        transaction_id=alert.transaction_id,
        status="PENDING",
    )
    alert.status = "UNDER_REVIEW"
    db.add(verification)
    db.flush()
    db.add(InvestigationEvent(
        alert_id=alert_id,
        event_type="VERIFICATION_REQUESTED",
        description="Simulated voice verification requested from customer",
    ))
    db.commit()
    db.refresh(verification)
    return verification_payload(db, verification)


@router.get("/{alert_id}/verification", response_model=VerificationRequestResponse | None)
def alert_verification(alert_id: str, db: Session = Depends(get_db)):
    get_alert_or_404(db, alert_id)
    verification = db.scalar(
        select(CustomerVerification)
        .where(CustomerVerification.alert_id == alert_id)
        .order_by(CustomerVerification.requested_at.desc())
    )
    return verification_payload(db, verification) if verification else None


@router.get("/{alert_id}/activity", response_model=list[InvestigationEventResponse])
def alert_activity(alert_id: str, db: Session = Depends(get_db)):
    get_alert_or_404(db, alert_id)
    return list(db.scalars(
        select(InvestigationEvent)
        .where(InvestigationEvent.alert_id == alert_id)
        .order_by(InvestigationEvent.created_at)
    ))


@router.get("/{alert_id}/notes", response_model=list[InvestigatorNoteResponse])
def list_notes(alert_id: str, db: Session = Depends(get_db)):
    get_alert_or_404(db, alert_id)
    return list(db.scalars(
        select(InvestigatorNote)
        .where(InvestigatorNote.alert_id == alert_id)
        .order_by(InvestigatorNote.created_at)
    ))


@router.post("/{alert_id}/notes", response_model=InvestigatorNoteResponse, status_code=201)
def add_note(alert_id: str, payload: InvestigatorNoteCreate, db: Session = Depends(get_db)):
    get_alert_or_404(db, alert_id)
    note = InvestigatorNote(alert_id=alert_id, **payload.model_dump())
    db.add(note)
    db.flush()
    db.add(InvestigationEvent(
        alert_id=alert_id,
        event_type="NOTE_ADDED",
        description="Investigator note added",
        investigator=payload.investigator,
    ))
    db.commit()
    db.refresh(note)
    return note


verification_router = APIRouter(prefix="/api/verification", tags=["verification"])


@verification_router.get("/customers/{customer_id}", response_model=VerificationRequestResponse | None)
def customer_verification(customer_id: str, db: Session = Depends(get_db)):
    verification = db.scalar(
        select(CustomerVerification)
        .where(
            CustomerVerification.customer_id == customer_id,
            CustomerVerification.status == "PENDING",
        )
        .order_by(CustomerVerification.requested_at.desc())
    )
    return verification_payload(db, verification) if verification else None


@verification_router.post("/{verification_id}/response", response_model=VerificationRequestResponse)
def submit_verification_response(
    verification_id: str,
    payload: VerificationResponseRequest,
    db: Session = Depends(get_db),
):
    verification = db.get(CustomerVerification, verification_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")
    if verification.status == "COMPLETED":
        raise HTTPException(status_code=409, detail="Verification already completed")

    verification.status = "COMPLETED"
    verification.customer_response = payload.response
    verification.responded_at = datetime.utcnow()
    db.add(InvestigationEvent(
        alert_id=verification.alert_id,
        event_type="CUSTOMER_VERIFICATION_RESPONSE",
        description=f"Customer response recorded: {payload.response}",
    ))
    db.commit()
    db.refresh(verification)
    return verification_payload(db, verification)
