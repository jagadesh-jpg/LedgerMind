from backend.app.models import (
    ExceptionReport, MemoryHit, AgentRecommendationOutput, RecommendationResponse
)

def apply_guardrails(
    invoice_id: str,
    vendor_id: str,
    report: ExceptionReport,
    memories: list[MemoryHit],
    agent_output: AgentRecommendationOutput,
    memory_backend: str
) -> RecommendationResponse:
    """
    Evaluates hard guardrails, evidence thresholds, and conflicting memories.
    """
    facts = report.facts
    inv_total = facts.get("invoice_total", 0)

    # 1. HARD RULE: Invalid GSTIN format or GSTIN mismatch forces HOLD_PAYMENT / ESCALATE
    if "INVALID_GSTIN_FORMAT" in report.failed_checks:
        return RecommendationResponse(
            invoice_id=invoice_id,
            action="HOLD_PAYMENT",
            reasoning="Hard Guardrail: Supplier GSTIN format is invalid under Indian tax regulations. Payment must be held.",
            confidence_label="High",
            evidence_agree_count=len(memories),
            evidence_total_count=len(memories),
            conflict=False,
            memory_backend=memory_backend,
            is_hard_rule_override=True
        )

    # 2. HARD RULE: Suspected Duplicate Waybill forces ESCALATE / HOLD_PAYMENT
    if "DUPLICATE_WAYBILL_FLAG" in report.failed_checks:
        return RecommendationResponse(
            invoice_id=invoice_id,
            action="HOLD_PAYMENT",
            reasoning="Hard Guardrail: Duplicate waybill docket detected on previously submitted settlement. Payment held for duplicate audit.",
            confidence_label="High",
            evidence_agree_count=len(memories),
            evidence_total_count=len(memories),
            conflict=False,
            memory_backend=memory_backend,
            is_hard_rule_override=True
        )

    # 3. HARD RULE: High value invoices (> ₹10,00,000) with price variance must escalate to Finance Controller
    if inv_total > 1000000 and facts.get("price_variance_pct", 0) > 5.0:
        return RecommendationResponse(
            invoice_id=invoice_id,
            action="ESCALATE",
            reasoning=f"Hard Guardrail: Invoice amount (₹{inv_total:,.2f}) exceeds high-value threshold of ₹10,00,000 with >5% price deviation. Mandatory Senior AP Lead escalation.",
            confidence_label="High",
            evidence_agree_count=len(memories),
            evidence_total_count=len(memories),
            conflict=False,
            memory_backend=memory_backend,
            is_hard_rule_override=True
        )

    # 4. CONFLICT DETECTION: Check if past memories for similar variance recommend contradictory actions
    conflict = False
    conflicting_memories: list[MemoryHit] = []
    if len(memories) >= 2:
        distinct_actions = {m.decision for m in memories[:3]}
        if len(distinct_actions) > 1:
            conflict = True
            conflicting_memories = memories[:3]

    if conflict:
        return RecommendationResponse(
            invoice_id=invoice_id,
            action="ESCALATE",
            reasoning=f"Precedent Conflict Detected: Historical memories for {vendor_id} show conflicting resolution outcomes ({', '.join(distinct_actions)}). Escalating to human decision authority.",
            cited_memories=memories[:3],
            confidence_label="Low",
            evidence_agree_count=1,
            evidence_total_count=len(memories),
            conflict=True,
            conflicting_memories=conflicting_memories,
            memory_backend=memory_backend,
            is_hard_rule_override=False
        )

    # 5. EVIDENCE GATE: Fewer than 2 relevant memories force ESCALATE ("not enough history")
    if len(memories) < 2:
        return RecommendationResponse(
            invoice_id=invoice_id,
            action="ESCALATE",
            reasoning="Evidence Gate: Insufficient vendor decision history (< 2 past records). Escalated to AP specialist for baseline precedent establishment.",
            cited_memories=memories,
            confidence_label="Low",
            evidence_agree_count=len(memories),
            evidence_total_count=len(memories),
            conflict=False,
            memory_backend=memory_backend,
            is_hard_rule_override=False
        )

    # 6. Confidence Label Calibration:
    # High only if >= 3 relevant memories agree and none conflict; Medium for 2 agreeing; otherwise Low
    agree_count = sum(1 for m in memories if m.decision == agent_output.action)
    confidence_label = "Low"
    if agree_count >= 3 and not conflict:
        confidence_label = "High"
    elif agree_count >= 2:
        confidence_label = "Medium"

    # Map cited memory numbers from agent
    cited: list[MemoryHit] = []
    for num in agent_output.cited_memory_numbers:
        if 1 <= num <= len(memories):
            cited.append(memories[num - 1])
    if not cited and memories:
        cited = memories[:2]

    return RecommendationResponse(
        invoice_id=invoice_id,
        action=agent_output.action,
        reasoning=agent_output.reasoning,
        cited_memories=cited,
        confidence_label=confidence_label,
        evidence_agree_count=agree_count,
        evidence_total_count=len(memories),
        conflict=False,
        memory_backend=memory_backend,
        is_hard_rule_override=False
    )
