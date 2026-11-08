import pytest
from backend.app.config import settings
from backend.app.models import DecisionRecord

@pytest.mark.skipif(
    not settings.hindsight_api_key or not settings.hindsight_api_key.strip(),
    reason="Hindsight API key not configured in backend/.env; skipping live smoke test."
)
def test_hindsight_live_smoke():
    from backend.app.memory import HindsightMemory
    mem = HindsightMemory(base_url=settings.hindsight_base_url, api_key=settings.hindsight_api_key)

    record = DecisionRecord(
        decision_id="SMOKE-TEST-001",
        invoice_id="INV-SMOKE",
        vendor_id="VEND-SMOKE",
        vendor_name="Smoke Test Vendor",
        exception_type="PRICE_VARIANCE",
        decision="APPROVE",
        rationale="Automated live smoke test roundtrip.",
        reviewer="Smoke Test Harness",
        source_reference="SMOKE-REF",
        timestamp="01 Jan 2026",
        variance_amount=100.0,
        variance_pct=1.0
    )

    doc_id = mem.retain("smoke-bank", record)
    assert doc_id == "SMOKE-TEST-001"

    hits = mem.recall("smoke-bank", "VEND-SMOKE", "PRICE_VARIANCE", "smoke test", limit=1)
    assert isinstance(hits, list)
