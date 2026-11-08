from backend.app.models import ExceptionReport, MemoryHit, AgentRecommendationOutput
from backend.app.guardrails import apply_guardrails

def test_hard_rule_invalid_gstin():
    report = ExceptionReport(
        has_exception=True,
        exception_type="GST_MISMATCH",
        facts={"invoice_total": 50000},
        failed_checks=["INVALID_GSTIN_FORMAT"],
        passed_checks=[]
    )
    agent_out = AgentRecommendationOutput(
        action="APPROVE",
        reasoning="Testing",
        confidence_label="High"
    )
    res = apply_guardrails("INV-1", "VEND-1", report, [], agent_out, "local")
    assert res.action == "HOLD_PAYMENT"
    assert res.is_hard_rule_override is True

def test_evidence_gate_insufficient_memories():
    report = ExceptionReport(
        has_exception=True,
        exception_type="PRICE_VARIANCE",
        facts={"invoice_total": 50000, "price_variance_pct": 3.0},
        failed_checks=["PRICE_MISMATCH"],
        passed_checks=[]
    )
    agent_out = AgentRecommendationOutput(
        action="APPROVE",
        reasoning="Approved",
        confidence_label="High"
    )
    # Only 1 memory (< 2)
    single_mem = [MemoryHit(decision_id="1", text="Past hit", date="01 Nov", vendor_id="V1", exception_type="PRICE_VARIANCE", decision="APPROVE")]
    res = apply_guardrails("INV-1", "V1", report, single_mem, agent_out, "local")

    assert res.action == "ESCALATE"
    assert res.confidence_label == "Low"
    assert "Evidence Gate" in res.reasoning

def test_conflict_detection():
    report = ExceptionReport(
        has_exception=True,
        exception_type="PRICE_VARIANCE",
        facts={"invoice_total": 50000, "price_variance_pct": 6.0},
        failed_checks=["PRICE_MISMATCH"],
        passed_checks=[]
    )
    agent_out = AgentRecommendationOutput(
        action="APPROVE",
        reasoning="Approved",
        confidence_label="High"
    )
    # Conflicting memories: APPROVE vs HOLD_PAYMENT
    conflicting = [
        MemoryHit(decision_id="1", text="Past hit 1", date="01 Nov", vendor_id="V1", exception_type="PRICE_VARIANCE", decision="APPROVE"),
        MemoryHit(decision_id="2", text="Past hit 2", date="02 Nov", vendor_id="V1", exception_type="PRICE_VARIANCE", decision="HOLD_PAYMENT"),
    ]
    res = apply_guardrails("INV-1", "V1", report, conflicting, agent_out, "local")

    assert res.action == "ESCALATE"
    assert res.conflict is True
    assert len(res.conflicting_memories) >= 2
