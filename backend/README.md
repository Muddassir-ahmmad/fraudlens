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

The API is available at `http://localhost:8000`; interactive docs are at `/docs`. SQLite is created at `backend/data/fraudlens.db` and demo data is seeded on first startup.

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
