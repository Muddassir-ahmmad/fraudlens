# FraudLens Backend

FraudLens is a hackathon MVP for a bank fraud investigator. It analyzes simulated digital payment transactions using deterministic, explainable rules. It does not connect to banks, move money, or apply real account restrictions.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`; interactive docs are at `/docs`. Set `DATABASE_URL` to the Supabase PostgreSQL connection string to use Supabase. Without it, the existing SQLite file is used for local compatibility.

## Supabase migration

1. In Supabase, open **Project Settings > Database** and copy the direct PostgreSQL connection string. Use the database password you created for the project.
2. Set it in the backend environment without committing it:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

3. Install the PostgreSQL driver and copy the existing SQLite data:

```powershell
pip install -r requirements.txt
python scripts/migrate_to_supabase.py
uvicorn app.main:app --reload
```

The migration is additive and copies transactions, alerts, verification requests, investigation events, and investigator notes. Do not commit the connection string; `.env` files are ignored.

## API

- `GET /api/health`
- `GET /api/dashboard/summary`
- `GET /api/transactions?customer_id=CUST001&risk_level=HIGH&limit=100`
- `GET /api/transactions/{transaction_id}`
- `POST /api/transactions/simulate`
- `GET /api/customers/{customer_id}/transactions`
- `GET /api/customers/{customer_id}/timeline`
- `GET /api/alerts?status=NEW`
- `GET /api/alerts/{alert_id}`
- `PATCH /api/alerts/{alert_id}`
- `POST /api/alerts/{alert_id}/action`

## Simulate a transaction

```json
{
  "customer_id": "CUST001",
  "sender": "UNKNOWN",
  "receiver": "Rahul",
  "amount": 500000,
  "timestamp": "2026-09-19T02:30:00",
  "location": "Bengaluru",
  "device": "unknown",
  "merchant": "Unknown Merchant",
  "transaction_type": "CREDIT"
}
```

A high-risk response includes `risk_score`, `risk_level`, and every reason that contributed to the score:

```json
{
  "risk_score": 95,
  "risk_level": "HIGH",
  "risk_reasons": [
    "Transaction amount significantly differs from customer's normal activity",
    "Sender is unfamiliar",
    "Transaction uses an unfamiliar device",
    "Transaction occurred at an unusual time",
    "Transaction differs from historical behavior"
  ]
}
```

## Scoring

Scores are capped at 100. Amount deviation contributes 10, 20, or 35 points; an unfamiliar sender contributes 20; an unusual time (before 06:00 or after 23:00) contributes 20; a new location and device contribute 10 each. Scores map to `LOW` (0-30), `MEDIUM` (31-60), and `HIGH` (61-100). A `HIGH` transaction creates an alert.

The frontend should use the base URL `http://localhost:8000`, fetch dashboard and transaction data on load, and use the returned IDs to navigate to detail/timeline views. Send the investigator's simulated decision to `/api/alerts/{alert_id}/action` with `{ "action": "UNDER_REVIEW", "notes": "..." }`.

## Simulated Voice Verification

For a HIGH-risk alert, an investigator can request customer verification from the investigation page. The request is stored in SQLite, the alert moves to `UNDER_REVIEW`, and a `VERIFICATION_REQUESTED` event is recorded.

The customer opens `/verify/{customer_id}`, answers the simulated incoming call, and the browser's native `speechSynthesis` reads the actual payment amount and recipient. The customer chooses `PAYMENT_VALID`, `PAYMENT_NOT_AUTHORIZED`, or `CUSTOMER_NEEDS_HELP`. The response is stored in `customer_verifications` and recorded as `CUSTOMER_VERIFICATION_RESPONSE` in investigation activity.

This is an in-app simulation. It does not make phone calls, contact real customers, move money, freeze accounts, or prove fraud. The investigator makes the final decision.

Verification endpoints:

- `POST /api/alerts/{alert_id}/verification-request`
- `GET /api/alerts/{alert_id}/verification`
- `GET /api/alerts/{alert_id}/activity`
- `GET /api/verification/customers/{customer_id}`
- `POST /api/verification/{verification_id}/response`

## Customer payment demo

The customer-facing demo is available at `http://localhost:5173/pay`. It uses the real backend analysis flow:

1. Select a demo customer and recipient type.
2. Enter an amount or choose the Normal payment/Suspicious demo preset.
3. The frontend calls `POST /api/transactions/pay`.
4. The existing deterministic fraud engine scores the transaction and stores it in SQLite.
5. A HIGH result is stored as `REQUIRES_REVIEW` and creates an investigator alert.

The payment endpoint accepts `customer_id`, `recipient`, `recipient_type`, `amount`, and an optional `timestamp`. It returns the risk score, risk level, explainable factors, transaction status, and whether an alert was created. This is a simulated payment flow: it does not move money, freeze accounts, or claim certainty of fraud.

This repository does not currently contain an ML dependency or trained model. The customer flow reuses the existing deterministic fraud engine so the hackathon result remains local, fast, reproducible, and explainable instead of presenting a fabricated ML probability.
