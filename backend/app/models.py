from pydantic import BaseModel, Field
from typing import Literal, Any
from decimal import Decimal

class LineItemPO(BaseModel):
    item_description: str
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    gst_rate: Decimal
    gstin: str

class LineItemGRN(BaseModel):
    grn_number: str
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    received_date: str

class LineItemInvoice(BaseModel):
    quantity: Decimal
    unit_price: Decimal
    total_amount: Decimal
    gst_rate: Decimal
    gstin: str

class DocumentItemComparison(BaseModel):
    line_item_id: str
    item_description: str
    po: LineItemPO
    grn: LineItemGRN
    invoice: LineItemInvoice

class ExceptionReport(BaseModel):
    has_exception: bool
    exception_type: str  # "NONE", "PRICE_VARIANCE", "QTY_VARIANCE", "DUPLICATE_SUSPECT", "GST_MISMATCH", "MISSING_INFO", "ROUNDING_DIFF"
    facts: dict[str, Any]
    failed_checks: list[str]
    passed_checks: list[str]

class DecisionRecord(BaseModel):
    decision_id: str
    invoice_id: str
    vendor_id: str
    vendor_name: str
    exception_type: str
    decision: Literal["APPROVE", "HOLD_PAYMENT", "REQUEST_CREDIT_NOTE", "ASK_VENDOR", "ESCALATE"]
    rationale: str
    reviewer: str
    source_reference: str
    timestamp: str
    variance_amount: float
    variance_pct: float

class MemoryHit(BaseModel):
    decision_id: str
    text: str
    date: str
    vendor_id: str
    exception_type: str
    decision: str
    score: float = 1.0

class VendorProfile(BaseModel):
    vendor_id: str
    summary: str
    total_decisions: int = 0
    action_counts: dict[str, int] = Field(default_factory=dict)

class AgentRecommendationOutput(BaseModel):
    action: Literal["APPROVE", "HOLD_PAYMENT", "REQUEST_CREDIT_NOTE", "ASK_VENDOR", "ESCALATE"]
    reasoning: str
    cited_memory_numbers: list[int] = Field(default_factory=list)
    confidence_label: Literal["High", "Medium", "Low"]

class RecommendationResponse(BaseModel):
    invoice_id: str
    action: Literal["APPROVE", "HOLD_PAYMENT", "REQUEST_CREDIT_NOTE", "ASK_VENDOR", "ESCALATE"]
    reasoning: str
    cited_memories: list[MemoryHit] = Field(default_factory=list)
    confidence_label: Literal["High", "Medium", "Low"]
    evidence_agree_count: int = 0
    evidence_total_count: int = 0
    conflict: bool = False
    conflicting_memories: list[MemoryHit] = Field(default_factory=list)
    memory_backend: str
    is_hard_rule_override: bool = False

class HumanDecisionRequest(BaseModel):
    decision_type: Literal["Accept Recommendation", "Edit Recommendation", "Reject Recommendation"]
    action: Literal["APPROVE", "HOLD_PAYMENT", "REQUEST_CREDIT_NOTE", "ASK_VENDOR", "ESCALATE"]
    reason: str
    reviewer: str = "Anand Kumar (AP Controller)"
