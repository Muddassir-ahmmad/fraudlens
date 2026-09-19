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


def test_customer_payment_normal_and_suspicious_flow():
    with TestClient(app) as client:
        normal = client.post(
            "/api/transactions/pay",
            json={
                "customer_id": "CUST001",
                "recipient": "Rahul",
                "recipient_type": "KNOWN",
                "amount": 5000,
                "timestamp": "2026-09-19T15:00:00",
            },
        )
        assert normal.status_code == 201
        assert normal.json()["risk_level"] == "LOW"
        assert normal.json()["alert_created"] is False

        suspicious = client.post(
            "/api/transactions/pay",
            json={
                "customer_id": "CUST001",
                "recipient": "New Recipient",
                "recipient_type": "UNKNOWN",
                "amount": 500000,
                "timestamp": "2026-09-19T02:30:00",
            },
        )
        assert suspicious.status_code == 201
        result = suspicious.json()
        assert result["risk_level"] == "HIGH"
        assert result["alert_created"] is True
        assert result["status"] == "REQUIRES_REVIEW"
        assert any(factor["name"] == "Recipient familiarity" for factor in result["risk_factors"])


def test_simulated_voice_verification_flow_and_duplicate_response():
    with TestClient(app) as client:
        payment = client.post(
            "/api/transactions/pay",
            json={
                "customer_id": "CUST001",
                "recipient": "Unknown Contact",
                "recipient_type": "UNKNOWN",
                "amount": 500000,
                "timestamp": "2026-09-20T02:30:00",
            },
        ).json()
        alerts = client.get("/api/alerts").json()
        alert = next(item for item in alerts if item["transaction_id"] == payment["transaction_id"])

        request = client.post(f"/api/alerts/{alert['alert_id']}/verification-request")
        assert request.status_code == 201
        verification = request.json()
        assert verification["status"] == "PENDING"
        assert client.get("/api/verification/customers/CUST001").json()["verification_id"] == verification["verification_id"]

        response = client.post(
            f"/api/verification/{verification['verification_id']}/response",
            json={"response": "PAYMENT_NOT_AUTHORIZED"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "COMPLETED"

        note = client.post(
            f"/api/alerts/{alert['alert_id']}/notes",
            json={"content": "Customer response requires investigator review."},
        )
        assert note.status_code == 201
        assert client.get(f"/api/alerts/{alert['alert_id']}/notes").json()[0]["content"] == note.json()["content"]

        duplicate = client.post(
            f"/api/verification/{verification['verification_id']}/response",
            json={"response": "PAYMENT_VALID"},
        )
        assert duplicate.status_code == 409

        activity = client.get(f"/api/alerts/{alert['alert_id']}/activity").json()
        event_types = {event["event_type"] for event in activity}
        assert "VERIFICATION_REQUESTED" in event_types
        assert "CUSTOMER_VERIFICATION_RESPONSE" in event_types
        assert "NOTE_ADDED" in event_types
