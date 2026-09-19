from fastapi.testclient import TestClient

from app.main import app


def test_health_and_seeded_dashboard():
    with TestClient(app) as client:
        assert client.get("/api/health").json()["status"] == "ok"
        summary = client.get("/api/dashboard/summary").json()
        assert summary["total_transactions"] >= 9
        assert summary["high_risk_count"] >= 1
        assert summary["new_alerts"] >= 1


def test_simulate_alert_and_action():
    with TestClient(app) as client:
        response = client.post(
            "/api/transactions/simulate",
            json={
                "customer_id": "CUST001",
                "sender": "UNKNOWN",
                "receiver": "Rahul",
                "amount": 500000,
                "timestamp": "2026-09-19T02:30:00",
                "location": "Bengaluru",
                "device": "unknown",
                "merchant": "Unknown Merchant",
                "transaction_type": "CREDIT",
            },
        )
        assert response.status_code == 201
        transaction = response.json()
        assert transaction["risk_level"] == "HIGH"
        assert transaction["risk_reasons"]

        alerts = client.get("/api/alerts").json()
        alert = next(item for item in alerts if item["transaction_id"] == transaction["transaction_id"])
        action = client.post(
            f"/api/alerts/{alert['alert_id']}/action",
            json={"action": "UNDER_REVIEW", "notes": "Verify sender identity"},
        )
        assert action.status_code == 200
        assert action.json()["status"] == "UNDER_REVIEW"


def test_customer_history_and_timeline():
    with TestClient(app) as client:
        history = client.get("/api/customers/CUST001/transactions")
        timeline = client.get("/api/customers/CUST001/timeline")
        assert history.status_code == timeline.status_code == 200
        assert len(history.json()) == len(timeline.json())
        assert timeline.json()[0]["timestamp"] < timeline.json()[-1]["timestamp"]
