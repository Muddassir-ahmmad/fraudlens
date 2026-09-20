# FraudLens

> **See the risk. Understand the reason. Investigate faster.**

FraudLens is a digital payment fraud detection and investigation platform designed to help bank fraud investigators identify suspicious transactions, understand why they were flagged, and investigate them through a centralized dashboard.

The system analyzes transactions using an explainable rule-based risk engine and assigns each transaction a risk score from **0–100**, along with a risk level and the factors that contributed to the score.

---

## 📌 Problem Statement

Digital payment systems process a large number of transactions every day. Among these transactions, some may show unusual behavior that requires investigation.

The challenge is not only to identify suspicious transactions, but also to answer:

- Why was this transaction flagged?
- How unusual is the transaction?
- What is the customer's normal transaction behavior?
- What happened before and after the suspicious transaction?
- What action should an investigator record?

FraudLens addresses this problem by combining transaction analysis, explainable risk scoring, alerts, customer history, investigation timelines, and investigator actions into one platform.

---

# 💡 Solution

FraudLens acts as a fraud monitoring and investigation system.

### Basic flow

```text
Transaction
     ↓
FraudLens Risk Engine
     ↓
Risk Score (0–100)
     ↓
Risk Level
     ↓
Explainable Risk Factors
     ↓
Alert if Suspicious
     ↓
Investigator Dashboard
     ↓
Customer History + Timeline
     ↓
Investigation / Action
````

The system does not automatically declare every unusual transaction as fraud.

Instead, it identifies transactions that require attention and provides supporting information to the investigator.

---

# 🎯 Objectives

FraudLens aims to:

* Detect potentially suspicious digital payment activity.
* Assign an understandable risk score.
* Classify transactions into risk levels.
* Explain why a transaction was flagged.
* Generate alerts for high-risk transactions.
* Provide customer transaction history.
* Provide investigation timelines.
* Allow investigators to record actions.
* Maintain investigation activity and notes.
* Provide dashboard-level fraud analytics.
* Simulate transactions for demonstrations.

---

# 🚀 Key Features

## 1. Transaction Simulator

FraudLens includes a transaction simulator for demonstration purposes.

Investigators can simulate a payment and allow the system to immediately analyze it.

Example:

```text
Customer: Rahul
Amount: ₹5,00,000
Recipient: New / Unknown
Time: 2:30 AM
Device: Unknown
Location: Different from usual
```

The transaction is passed through the fraud detection engine and assigned a risk score.

---

## 2. Explainable Fraud Detection

FraudLens does not simply display:

```text
FRAUD DETECTED
```

Instead, it explains the reasons behind the risk score.

Example:

```text
Risk Score: 91
Risk Level: HIGH

Reasons:
✓ Transaction amount is significantly higher than usual
✓ Recipient is unfamiliar
✓ Transaction occurred at an unusual time
✓ Device is not previously associated with the customer
✓ Location differs from normal activity
```

This makes the result easier for an investigator to understand.

---

# 🧠 FraudLens Risk Engine

The current FraudLens implementation uses a **rule-based risk engine**.

It is intentionally explainable and deterministic.

The current system does **not** claim to use a production machine-learning model.

### Detection factors

The engine can consider factors such as:

* Transaction amount deviation
* Recipient familiarity
* Transaction time
* Device information
* Location differences
* Historical transaction behavior

Each applicable factor contributes to the overall risk score.

---

# 📊 Risk Score

Every analyzed transaction receives a score between:

```text
0 ─────────────────────────────── 100
```

The prototype classifies transactions as:

| Risk Score | Risk Level |
| ---------: | ---------- |
|       0–30 | LOW        |
|      31–60 | MEDIUM     |
|     61–100 | HIGH       |

> These thresholds are prototype parameters for the hackathon demonstration and are not banking industry standards.

---

# 🚨 Fraud Alerts

When a transaction reaches a high-risk level, FraudLens can create an alert for the investigator.

An alert contains information such as:

* Transaction
* Customer
* Amount
* Risk score
* Risk level
* Risk reasons
* Alert status
* Investigation actions
* Activity history

---

# 👨‍💼 Investigator Dashboard

The investigator dashboard acts as the main control center.

It provides information such as:

* Total transactions
* High-risk transactions
* Medium-risk transactions
* Low-risk transactions
* Active alerts
* Risk trends
* Recent suspicious activity
* Transaction statistics

Investigators can use the dashboard to quickly identify transactions that require attention.

---

# 🔎 Transaction Search & Filtering

Investigators can search and filter transaction data.

This allows them to find transactions based on relevant information instead of manually going through every transaction.

The system supports transaction and alert filtering through the backend APIs.

---

# 👤 Customer Investigation Profile

FraudLens provides an investigator-focused customer profile.

The profile can contain:

* Customer information
* Transaction history
* Total transaction amount
* Average transaction amount
* Number of transactions
* Related alerts
* Risk information
* Investigation timeline

Example:

```text
Customer: Rahul

Average Transaction:
₹5,200

Recent Transaction:
₹5,000

Suspicious Transaction:
₹5,00,000

Risk:
HIGH
```

This helps the investigator compare the suspicious transaction against the customer's historical behavior.

---

# 🕒 Investigation Timeline

FraudLens maintains an investigation timeline.

The timeline can record important events such as:

```text
Transaction created
        ↓
Risk analysis completed
        ↓
Alert generated
        ↓
Investigation started
        ↓
Investigator added note
        ↓
Investigator performed action
```

This provides a chronological view of what happened during an investigation.

---

# 📝 Investigator Notes

Investigators can add notes to an investigation.

Example:

```text
"Transaction amount is significantly higher
than customer's normal activity. Recipient is
not present in previous transaction history."
```

Notes are persisted in the database and can be associated with the investigation.

---

# 📋 Investigation Activity

FraudLens records investigation-related activities.

Examples include:

```text
ALERT_CREATED
INVESTIGATION_STARTED
NOTE_ADDED
ACTION_PERFORMED
VERIFICATION_REQUESTED
```

This provides an audit-style history of the investigation process.

---

# 🔄 Alert Status

Alerts can move through different investigation states.

Example:

```text
NEW
 ↓
UNDER_REVIEW
 ↓
RESOLVED
```

The exact action performed by an investigator is also recorded.

---

# ⚡ Example Demo Scenario

Consider a customer named **Rahul**.

His normal transactions are:

```text
₹2,500
₹6,000
₹4,500
₹8,000
₹5,000
```

Then a new transaction occurs:

```text
₹5,00,000
```

The system compares the transaction with the customer's previous behavior.

Additional signals may include:

```text
✓ Very large amount
✓ Unfamiliar recipient
✓ Unusual transaction time
✓ Unknown device
✓ Different location
```

FraudLens produces:

```text
Risk Score: 91
Risk Level: HIGH
```

An alert is created.

The investigator opens the alert and sees:

1. Transaction details
2. Risk score
3. Risk factors
4. Customer history
5. Customer profile
6. Investigation timeline
7. Investigator notes
8. Available investigation actions

This demonstrates the complete fraud investigation workflow.

---

# 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │   Transaction       │
                 │     Simulator       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     React          │
                 │     Frontend       │
                 └──────────┬──────────┘
                            │
                         REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │      FastAPI       │
                 │      Backend       │
                 └──────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌─────────────────┐     ┌─────────────────┐
       │ FraudLens Risk  │     │ Investigation   │
       │     Engine      │     │    Services     │
       └────────┬────────┘     └────────┬────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                    ┌───────────────┐
                    │    SQLite     │
                    │   Database    │
                    └───────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS / UI components
* REST API integration

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

## Database

Current development/demo database:

* SQLite

The database stores transactions, alerts, investigation information, notes, and related data.

## Testing

* Pytest
* FastAPI API testing

---

# 📁 Project Structure

```text
fraudlens/
│
├── backend/
│   │
│   ├── app/
│   │   ├── fraud/
│   │   │   └── engine.py
│   │   │
│   │   ├── models/
│   │   │   └── entities.py
│   │   │
│   │   ├── routes/
│   │   │   ├── alerts.py
│   │   │   ├── transactions.py
│   │   │   └── dashboard.py
│   │   │
│   │   ├── schemas/
│   │   │   └── api.py
│   │   │
│   │   ├── services/
│   │   │   ├── seed.py
│   │   │   └── transactions.py
│   │   │
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── tests/
│   │   └── test_api.py
│   │
│   ├── scripts/
│   │
│   ├── data/
│   │   └── fraudlens.db
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── ...
│
├── package.json
└── README.md
```

---

# 🔌 API Endpoints

The backend exposes REST APIs for transactions, alerts, customers, dashboard analytics, and investigation workflows.

## Dashboard

```http
GET /api/dashboard/summary
```

Returns dashboard-level fraud statistics.

---

## Transactions

### Get transactions

```http
GET /api/transactions
```

Returns transactions with supported search/filter parameters.

### Get transaction

```http
GET /api/transactions/{transaction_id}
```

Returns details of a specific transaction.

### Simulate transaction

```http
POST /api/transactions/simulate
```

Creates and analyzes a simulated transaction.

---

# 👤 Customer APIs

### Customer transactions

```http
GET /api/customers/{customer_id}/transactions
```

Returns the customer's transaction history.

### Customer timeline

```http
GET /api/customers/{customer_id}/timeline
```

Returns the customer's activity timeline.

---

# 🚨 Alert APIs

### Get alerts

```http
GET /api/alerts
```

Returns available fraud alerts.

### Get alert

```http
GET /api/alerts/{alert_id}
```

Returns detailed information about an alert.

### Update alert

```http
PATCH /api/alerts/{alert_id}
```

Updates alert information/status.

### Perform investigation action

```http
POST /api/alerts/{alert_id}/action
```

Records an investigator action.

---

# ▶️ Running the Backend

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

---

# 📚 API Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

This allows developers to:

* View available endpoints
* Inspect request schemas
* Send test requests
* View responses
* Test the backend without the frontend

---

# ▶️ Running the Frontend

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server will provide a local URL, normally similar to:

```text
http://localhost:5173
```

The frontend communicates with the FastAPI backend through REST APIs.

---

# 🔗 Frontend ↔ Backend Flow

```text
User
 │
 ▼
React Frontend
 │
 │ HTTP Request
 ▼
FastAPI Backend
 │
 ├── Fraud Engine
 ├── Transaction Services
 ├── Alert Services
 └── Investigation Services
 │
 ▼
SQLite Database
 │
 ▼
FastAPI Response
 │
 ▼
React Frontend
 │
 ▼
User
```

---

# 🧪 Running Tests

From the backend directory:

```bash
pytest
```

The test suite checks important backend API behavior.

The current implementation has automated API tests covering the implemented functionality.

---

# 🔐 Security & Privacy Note

FraudLens is a hackathon prototype.

It does not connect to real banking systems and does not process real customer financial information.

All transactions used for demonstration are simulated/demo data.

The project should not be used to make real financial decisions without significant additional security, compliance, validation, monitoring, and infrastructure work.

---

# ⚠️ Prototype Limitations

FraudLens is designed as a hackathon MVP rather than a production banking system.

Current limitations include:

* SQLite is used for the current demo environment.
* Authentication/role-based access is limited or not production-ready.
* Fraud detection uses a rule-based engine rather than a production ML model.
* Transaction data is simulated.
* Investigator actions are simulated.
* Risk thresholds are prototype parameters.
* No real banking/payment network is connected.
* No real account freezing or fund blocking is performed.
* Production-grade audit, security, compliance, and monitoring are not implemented.

---

# 🔮 Future Enhancements

Possible future improvements include:

### Machine Learning

Train and integrate a fraud classification model using historical transaction data.

### Production Database

Move from SQLite to PostgreSQL or another production-grade database.

### Authentication

Add secure authentication and role-based authorization.

### Real-Time Processing

Process payment events through a real-time event/streaming architecture.

### Advanced Analytics

Add more detailed fraud trends, customer behavior analysis, and anomaly detection.

### Customer Verification

Add a customer-facing verification workflow where suspicious transactions can be confirmed or denied.

### External Integrations

Integrate with legitimate banking/payment infrastructure through secure APIs.

---

# 🎬 Hackathon Demo Flow

The recommended demonstration flow is:

```text
1. Open FraudLens
        ↓
2. Open Investigator Dashboard
        ↓
3. Show normal customer activity
        ↓
4. Simulate a suspicious transaction
        ↓
5. FraudLens analyzes transaction
        ↓
6. Risk score is generated
        ↓
7. Transaction becomes HIGH RISK
        ↓
8. Alert appears on dashboard
        ↓
9. Investigator opens the alert
        ↓
10. Show explainable risk factors
        ↓
11. Open customer profile
        ↓
12. Show transaction history
        ↓
13. Show investigation timeline
        ↓
14. Add investigator note
        ↓
15. Perform investigation action
        ↓
16. Alert status is updated
```

---

# 🧑‍💻 Development Workflow

The project uses Git for collaborative development.

### Main branch

```text
main
```

Contains stable/demo-ready code.

### Backend branch

```text
feature/backend
```

Used for backend development.

### Frontend branch

```text
feature/frontend
```

Used for frontend development.

### Feature branches

Additional feature branches can be created for larger changes.

Example:

```text
feature/customer-payment-fraud
```

---

# 🔄 Git Workflow

Before starting work:

```bash
git checkout main
git pull origin main
```

Create or switch to your feature branch:

```bash
git checkout -b feature/my-feature
```

After making changes:

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Changes should be reviewed before merging into `main`.

---

# 👥 Team

## FraudLens Team

* **Mudassir Ahmmad**
* **Team Member**

### Responsibilities

Backend development includes:

* FastAPI backend
* Database
* Fraud detection engine
* Risk scoring
* Transaction simulator
* APIs
* Investigation logic

Frontend development includes:

* Investigator dashboard
* Transaction interface
* Alert interface
* Investigation pages
* Customer investigation views
* API integration
* UI/UX

---

# 📌 Important Design Principle

FraudLens follows an **explainability-first** approach.

Instead of only saying:

```text
HIGH RISK
```

the system attempts to answer:

```text
Why is this transaction unusual?
```

This allows the investigator to understand the transaction and make an informed investigation decision.

---

# 🏁 Project Status

FraudLens currently provides a functional hackathon MVP containing:

* Transaction simulation
* Rule-based fraud detection
* Risk scoring
* Risk classification
* Explainable risk factors
* Fraud alerts
* Transaction search/filtering
* Customer investigation profile
* Transaction history
* Investigation timeline
* Investigator notes
* Investigation activity tracking
* Alert status management
* Dashboard analytics
* REST APIs
* SQLite persistence
* Automated backend tests
* React frontend
* FastAPI backend

---

# 📜 Disclaimer

FraudLens is an educational and hackathon prototype.

It is not a real banking fraud prevention system and should not be used with real financial data or relied upon for real-world financial decisions.

---

## FraudLens

**See the risk. Understand the reason. Investigate faster.**

```

### One important thing

I intentionally described your current system as a **rule-based FraudLens Risk Engine**, not as ML. That's the technically honest description of what you've built right now.

Also, I kept the **customer portal out of the main current feature list**, because you said you haven't added it yet.
```