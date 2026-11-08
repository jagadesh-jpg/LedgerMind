from backend.app.models import (
    ExceptionReport, MemoryHit, AgentRecommendationOutput, RecommendationResponse
)
from backend.app.config import settings
import logging
import json
import hashlib
from pathlib import Path

logger = logging.getLogger("ledgermind.agent")

CACHE_DIR = Path("./.agent_cache")
CACHE_DIR.mkdir(exist_ok=True)

def _prompt_hash(prompt: str) -> str:
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()

def get_cached_response(prompt: str) -> dict | None:
    h = _prompt_hash(prompt)
    f = CACHE_DIR / f"{h}.json"
    if f.exists():
        try:
            return json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None

def set_cached_response(prompt: str, data: dict):
    h = _prompt_hash(prompt)
    f = CACHE_DIR / f"{h}.json"
    try:
        f.write_text(json.dumps(data), encoding="utf-8")
    except Exception as e:
        logger.warning(f"Failed to cache prompt response: {e}")

def run_decision_agent(
    invoice_id: str,
    vendor_id: str,
    vendor_name: str,
    report: ExceptionReport,
    memories: list[MemoryHit],
    vendor_reflection_summary: str = ""
) -> AgentRecommendationOutput:
    """
    Decision agent backed by Groq LLM with offline fallback.
    Takes computed facts + recalled memories, produces Pydantic-validated JSON.
    """
    allowed_actions = ["APPROVE", "HOLD_PAYMENT", "REQUEST_CREDIT_NOTE", "ASK_VENDOR", "ESCALATE"]

    # Build memories text
    memories_text = ""
    for idx, m in enumerate(memories, start=1):
        memories_text += f"{idx}. [{m.date}] Decision: {m.decision} | Context: {m.text}\n"

    facts_summary = (
        f"Invoice ID: {invoice_id}\n"
        f"Vendor: {vendor_name} ({vendor_id})\n"
        f"Exception Type: {report.exception_type}\n"
        f"Invoice Total: ₹{report.facts.get('invoice_total', 0):,.2f}\n"
        f"PO Total: ₹{report.facts.get('po_total', 0):,.2f}\n"
        f"Variance Amount: ₹{report.facts.get('total_delta', 0):,.2f}\n"
        f"Price Delta: ₹{report.facts.get('price_delta', 0):,.2f} ({report.facts.get('price_variance_pct', 0)}%)\n"
        f"Quantity Delta: {report.facts.get('qty_delta', 0)} units ({report.facts.get('qty_variance_pct', 0)}%)\n"
        f"Failed Checks: {', '.join(report.failed_checks) if report.failed_checks else 'None'}\n"
        f"Passed Checks: {', '.join(report.passed_checks)}\n"
    )

    prompt = f"""You are the LedgerMind AP Exception Resolution Agent.
Analyze the following invoice exception using the deterministic facts and historical vendor memories.
DO NOT perform financial arithmetic. Rely strictly on the computed facts provided.

### INVOICE FACTS:
{facts_summary}

### HISTORICAL VENDOR MEMORIES:
{memories_text if memories_text else "No prior recorded memories for this vendor."}

### VENDOR PROFILE SUMMARY:
{vendor_reflection_summary if vendor_reflection_summary else "No historical profile."}

### INSTRUCTIONS:
Choose one action from: {allowed_actions}
Provide a plain-English explanation citing specific memory numbers (e.g. [1]) if relevant.
Assign confidence_label as 'High', 'Medium', or 'Low'.

Respond strictly in valid JSON matching this schema:
{{
  "action": "APPROVE|HOLD_PAYMENT|REQUEST_CREDIT_NOTE|ASK_VENDOR|ESCALATE",
  "reasoning": "Plain-English explanation referencing facts and memories",
  "cited_memory_numbers": [1],
  "confidence_label": "High|Medium|Low"
}}
"""

    # Check cache
    cached = get_cached_response(prompt)
    if cached:
        try:
            return AgentRecommendationOutput(**cached)
        except Exception:
            pass

    # If Groq is configured, attempt call
    if settings.groq_api_key:
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)

            for model_name in [settings.groq_primary_model, settings.groq_fallback_model]:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": "You are a professional enterprise Accounts Payable exception assistant. Output JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.1,
                        max_tokens=600,
                    )
                    content = response.choices[0].message.content
                    parsed = json.loads(content)
                    # Validate
                    output = AgentRecommendationOutput(
                        action=parsed.get("action", "ESCALATE"),
                        reasoning=parsed.get("reasoning", "Resolved based on precedent."),
                        cited_memory_numbers=parsed.get("cited_memory_numbers", []),
                        confidence_label=parsed.get("confidence_label", "Medium")
                    )
                    set_cached_response(prompt, output.model_dump())
                    return output
                except Exception as model_err:
                    logger.warning(f"Model {model_name} failed: {model_err}. Retrying or falling back.")
        except Exception as e:
            logger.warning(f"Groq API call error: {e}. Falling back to deterministic heuristic recommendation.")

    # Offline Fallback Heuristic Recommendation
    # Analyzes memories directly if available
    action: str = "ESCALATE"
    reasoning: str = ""
    citations: list[int] = []
    confidence: str = "Low"

    if not memories:
        action = "ESCALATE"
        reasoning = f"No historical precedent found for {vendor_name} regarding {report.exception_type}. Human authorization required."
        confidence = "Low"
    else:
        # Check if majority of agreeing memories suggest an action
        decisions = [m.decision for m in memories]
        from collections import Counter
        most_common, count = Counter(decisions).most_common(1)[0]
        action = most_common
        citations = [1]
        confidence = "High" if count >= 2 else "Medium"
        reasoning = (
            f"Based on {count} past decision(s) for {vendor_name}, the recommended action is {action}. "
            f"Precedent ({memories[0].date}) indicated: \"{memories[0].text}\"."
        )

    output = AgentRecommendationOutput(
        action=action if action in allowed_actions else "ESCALATE",
        reasoning=reasoning,
        cited_memory_numbers=citations,
        confidence_label=confidence
    )
    set_cached_response(prompt, output.model_dump())
    return output
