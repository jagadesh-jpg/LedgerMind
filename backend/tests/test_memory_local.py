from backend.app.memory import LocalMemory
from backend.app.models import DecisionRecord

def test_local_memory_retain_recall():
    mem = LocalMemory(db_path="./test_mem.db")
    rec = DecisionRecord(
        decision_id="TEST-MEM-01",
        invoice_id="INV-001",
        vendor_id="VEND-TEST",
        vendor_name="Test Vendor",
        exception_type="PRICE_VARIANCE",
        decision="APPROVE",
        rationale="Approved with valid test scrap circular.",
        reviewer="Test Reviewer",
        source_reference="PO-TEST",
        timestamp="01 Nov 2026",
        variance_amount=1500.0,
        variance_pct=4.2
    )

    mem.retain("comp-test", rec)
    hits = mem.recall("comp-test", "VEND-TEST", "PRICE_VARIANCE", "price variance", limit=5)

    assert len(hits) >= 1
    assert hits[0].decision == "APPROVE"
    assert "PO-TEST" in hits[0].text

def test_vendor_isolation():
    mem = LocalMemory(db_path="./test_mem.db")
    rec_a = DecisionRecord(
        decision_id="MEM-A", invoice_id="INV-A", vendor_id="VEND-A",
        vendor_name="Vendor A", exception_type="PRICE_VARIANCE", decision="APPROVE",
        rationale="Rat A", reviewer="Rev", source_reference="Ref A",
        timestamp="01 Nov 2026", variance_amount=100.0, variance_pct=1.0
    )
    rec_b = DecisionRecord(
        decision_id="MEM-B", invoice_id="INV-B", vendor_id="VEND-B",
        vendor_name="Vendor B", exception_type="PRICE_VARIANCE", decision="HOLD_PAYMENT",
        rationale="Rat B", reviewer="Rev", source_reference="Ref B",
        timestamp="01 Nov 2026", variance_amount=200.0, variance_pct=2.0
    )
    mem.retain("comp-1", rec_a)
    mem.retain("comp-1", rec_b)

    hits_a = mem.recall("comp-1", "VEND-A", "PRICE_VARIANCE", "query", limit=5)
    for h in hits_a:
        assert h.vendor_id == "VEND-A"

def test_vendor_reflection():
    mem = LocalMemory(db_path="./test_mem.db")
    prof = mem.reflect("comp-1", "VEND-A")
    assert prof.vendor_id == "VEND-A"
    assert prof.total_decisions >= 1
