import pytest
from fastapi.testclient import TestClient
from backend.app.api import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "memory_backend" in data
    assert "data_counts" in data

def test_dashboard_endpoint():
    res = client.get("/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "exceptionBreakdown" in data
    assert "recentInvoices" in data

def test_invoices_list_and_filter():
    res = client.get("/invoices?page=1&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) <= 5
    assert data["total"] >= 1

def test_invoice_details_404():
    res = client.get("/invoices/NONEXISTENT-999")
    assert res.status_code == 404

def test_invoice_details_success():
    res = client.get("/invoices/INV-2026-8941")
    assert res.status_code == 200
    data = res.json()
    assert data["invoice"]["id"] == "INV-2026-8941"
    assert "threeWayMatch" in data
    assert "exceptionReport" in data

def test_recommendation_endpoint():
    res = client.get("/invoices/INV-2026-8941/recommendation")
    assert res.status_code == 200
    data = res.json()
    assert "action" in data
    assert "confidence_label" in data
    assert "reasoning" in data

def test_decision_without_reason_rejected_when_editing():
    payload = {
        "decision_type": "Edit Recommendation",
        "action": "REQUEST_CREDIT_NOTE",
        "reason": "   ",
        "reviewer": "Anand Kumar"
    }
    res = client.post("/invoices/INV-2026-8941/decision", json=payload)
    assert res.status_code == 400
    assert "mandatory" in res.json()["detail"].lower()

def test_decision_success():
    payload = {
        "decision_type": "Accept Recommendation",
        "action": "APPROVE",
        "reason": "Verified and accepted.",
        "reviewer": "Anand Kumar"
    }
    res = client.post("/invoices/INV-2026-8938/decision", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_vendors_list_and_profile():
    res = client.get("/vendors")
    assert res.status_code == 200
    data = res.json()
    assert len(data["vendors"]) >= 1

    v_id = data["vendors"][0]["id"]
    p_res = client.get(f"/vendors/{v_id}/profile")
    assert p_res.status_code == 200
    assert "reflection" in p_res.json()
