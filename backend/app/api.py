from fastapi import FastAPI, HTTPException, Query, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import json
from pathlib import Path
from decimal import Decimal

from backend.app.config import settings
from backend.app.db import get_connection, init_db
from backend.app.models import (
    HumanDecisionRequest, DecisionRecord, DocumentItemComparison,
    LineItemPO, LineItemGRN, LineItemInvoice, RecommendationResponse
)
from backend.app.rules_engine import evaluate_three_way_match
from backend.app.memory import get_memory_store
from backend.app.agent import run_decision_agent
from backend.app.guardrails import apply_guardrails

# Initialize DB
init_db()

app = FastAPI(
    title="LedgerMind AP Exception Intelligence API",
    version="1.0.0",
    description="Enterprise Accounts Payable exception agent with deterministic rules, Hindsight memory, and human governance."
)

# Global Exception Handler returning JSON without stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "An internal server error occurred.", "detail": str(exc) if not isinstance(exc, (KeyError, ValueError)) else "Invalid input parameter."}
    )

# Restrict CORS explicitly to local development ports only
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

memory_store = get_memory_store()

@app.get("/health")
def health():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM invoices")
    invoice_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM vendors")
    vendor_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM human_decisions")
    decision_count = cur.fetchone()[0]
    conn.close()

    return {
        "status": "healthy",
        "memory_backend": memory_store.backend_name(),
        "groq_configured": bool(settings.groq_api_key and settings.groq_api_key.strip()),
        "hindsight_configured": bool(settings.hindsight_api_key and settings.hindsight_api_key.strip()),
        "data_counts": {
            "invoices": invoice_count,
            "vendors": vendor_count,
            "decisions": decision_count
        }
    }

@app.get("/dashboard")
def get_dashboard():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM invoices")
    total_invoices = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM invoices WHERE status = 'Needs Review'")
    pending_review = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM invoices WHERE exception_type != 'NONE'")
    open_exceptions = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM invoices WHERE status = 'Resolved'")
    resolved_invoices = cur.fetchone()[0]

    cur.execute("""
        SELECT exception_type, COUNT(*), SUM(amount)
        FROM invoices
        WHERE exception_type != 'NONE'
        GROUP BY exception_type
    """)
    breakdown_rows = cur.fetchall()

    breakdown = []
    for r in breakdown_rows:
        exc_type = r[0]
        cnt = r[1]
        amt = r[2] or 0
        cat_name = {
            "PRICE_VARIANCE": "Unit Price Mismatch",
            "QTY_VARIANCE": "Quantity Mismatch",
            "DUPLICATE_SUSPECT": "Possible Duplicate",
            "GST_MISMATCH": "Missing Information / GST Mismatch",
            "ROUNDING_DIFF": "Other Exceptions (Rounding)"
        }.get(exc_type, exc_type)

        breakdown.append({
            "category": cat_name,
            "count": cnt,
            "amountImpacted": amt,
            "percentage": round((cnt / open_exceptions * 100), 1) if open_exceptions > 0 else 0,
            "severity": "high" if "Price" in cat_name or "Duplicate" in cat_name else "medium"
        })

    cur.execute("""
        SELECT id, vendor_name, vendor_category, invoice_date, amount,
               exception_type, status, po_number, confidence_score
        FROM invoices
        ORDER BY created_at DESC
        LIMIT 10
    """)
    recent_invoices = [dict(row) for row in cur.fetchall()]

    conn.close()

    return {
        "kpis": [
            {
                "title": "Total Invoices",
                "value": f"{total_invoices:,}",
                "change": "+12.4%",
                "trend": "up",
                "isPositiveChange": True,
                "subtext": "Current 30-day volume",
                "iconName": "FileText"
            },
            {
                "title": "Pending Review",
                "value": str(pending_review),
                "change": "-5.2%",
                "trend": "down",
                "isPositiveChange": True,
                "subtext": "Awaiting human check",
                "iconName": "Clock"
            },
            {
                "title": "Open Exceptions",
                "value": str(open_exceptions),
                "change": "+3 new",
                "trend": "up",
                "isPositiveChange": False,
                "subtext": "Active mismatch cases",
                "iconName": "AlertTriangle"
            },
            {
                "title": "Resolved Invoices",
                "value": f"{resolved_invoices:,}",
                "change": f"{round(resolved_invoices / total_invoices * 100, 1) if total_invoices > 0 else 0}%",
                "trend": "up",
                "isPositiveChange": True,
                "subtext": f"{resolved_invoices} of {total_invoices} settled",
                "iconName": "CheckCircle2"
            }
        ],
        "exceptionBreakdown": breakdown,
        "recentInvoices": recent_invoices
    }

@app.get("/invoices")
def list_invoices(
    status: str | None = None,
    exception: str | None = None,
    vendor: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100)
):
    conn = get_connection()
    cur = conn.cursor()

    query = "SELECT * FROM invoices WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if exception:
        query += " AND exception_type = ?"
        params.append(exception)
    if vendor:
        query += " AND vendor_id = ?"
        params.append(vendor)
    if q:
        query += " AND (id LIKE ? OR vendor_name LIKE ? OR po_number LIKE ?)"
        wildcard = f"%{q}%"
        params.extend([wildcard, wildcard, wildcard])

    cur.execute(f"SELECT COUNT(*) FROM ({query})", params)
    total_count = cur.fetchone()[0]

    offset = (page - 1) * limit
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return {
        "items": [dict(r) for r in rows],
        "total": total_count,
        "page": page,
        "limit": limit
    }

@app.get("/invoices/{invoice_id}")
def get_invoice_details(invoice_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found in database.")

    inv_data = dict(row)

    base_qty = 200 if inv_data["vendor_id"] == "VEND-TATA" else 50
    inv_amount = Decimal(str(inv_data["amount"]))
    unit_price = (inv_amount / Decimal("1.18") / Decimal(str(base_qty))).quantize(Decimal("0.01"))

    gstin = "27AAACT2727Q1ZW" if inv_data["vendor_id"] == "VEND-TATA" else "27AAACS1414P1ZM"
    item = DocumentItemComparison(
        line_item_id="LINE-001",
        item_description=f"Standard commercial supplies for {inv_data['vendor_name']}",
        po=LineItemPO(
            item_description=f"Standard commercial supplies",
            quantity=Decimal(str(base_qty)),
            unit_price=unit_price if inv_data["exception_type"] != "PRICE_VARIANCE" else (unit_price - Decimal("1400")),
            total_amount=inv_amount if inv_data["exception_type"] != "PRICE_VARIANCE" else (inv_amount - Decimal("330400")),
            gst_rate=Decimal("18"),
            gstin=gstin
        ),
        grn=LineItemGRN(
            grn_number=inv_data["grn_number"] or "GRN-STANDARD",
            quantity=Decimal(str(base_qty)) if inv_data["exception_type"] != "QTY_VARIANCE" else (Decimal(str(base_qty)) - Decimal("10")),
            unit_price=unit_price,
            total_amount=inv_amount,
            received_date=inv_data["invoice_date"]
        ),
        invoice=LineItemInvoice(
            quantity=Decimal(str(base_qty)),
            unit_price=unit_price,
            total_amount=inv_amount,
            gst_rate=Decimal("18"),
            gstin=gstin
        )
    )

    report = evaluate_three_way_match(item, current_invoice_id=invoice_id, current_vendor_id=inv_data["vendor_id"])
    memories = memory_store.recall("comp-1", inv_data["vendor_id"], inv_data["exception_type"], inv_data["notes"] or "", limit=5)

    return {
        "invoice": inv_data,
        "threeWayMatch": item.model_dump(),
        "exceptionReport": report.model_dump(),
        "memoryHits": [m.model_dump() for m in memories],
        "memory_backend": memory_store.backend_name()
    }

@app.get("/invoices/{invoice_id}/recommendation")
def get_invoice_recommendation(invoice_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv = dict(row)

    base_qty = 200 if inv["vendor_id"] == "VEND-TATA" else 50
    inv_amount = Decimal(str(inv["amount"]))
    unit_price = (inv_amount / Decimal("1.18") / Decimal(str(base_qty))).quantize(Decimal("0.01"))
    gstin = "27AAACT2727Q1ZW"

    item = DocumentItemComparison(
        line_item_id="LINE-001",
        item_description=f"Supplies for {inv['vendor_name']}",
        po=LineItemPO(
            item_description="Supplies",
            quantity=Decimal(str(base_qty)),
            unit_price=unit_price if inv["exception_type"] != "PRICE_VARIANCE" else (unit_price - Decimal("1400")),
            total_amount=inv_amount if inv["exception_type"] != "PRICE_VARIANCE" else (inv_amount - Decimal("330400")),
            gst_rate=Decimal("18"),
            gstin=gstin
        ),
        grn=LineItemGRN(
            grn_number=inv["grn_number"] or "GRN-01",
            quantity=Decimal(str(base_qty)),
            unit_price=unit_price,
            total_amount=inv_amount,
            received_date=inv["invoice_date"]
        ),
        invoice=LineItemInvoice(
            quantity=Decimal(str(base_qty)),
            unit_price=unit_price,
            total_amount=inv_amount,
            gst_rate=Decimal("18"),
            gstin=gstin
        )
    )

    report = evaluate_three_way_match(item, current_invoice_id=invoice_id, current_vendor_id=inv["vendor_id"])
    memories = memory_store.recall("comp-1", inv["vendor_id"], inv["exception_type"], inv["notes"] or "", limit=5)
    vendor_profile = memory_store.reflect("comp-1", inv["vendor_id"])

    agent_output = run_decision_agent(
        invoice_id=invoice_id,
        vendor_id=inv["vendor_id"],
        vendor_name=inv["vendor_name"],
        report=report,
        memories=memories,
        vendor_reflection_summary=vendor_profile.summary
    )

    final_recommendation = apply_guardrails(
        invoice_id=invoice_id,
        vendor_id=inv["vendor_id"],
        report=report,
        memories=memories,
        agent_output=agent_output,
        memory_backend=memory_store.backend_name()
    )

    return final_recommendation

@app.post("/invoices/{invoice_id}/decision")
def record_invoice_decision(invoice_id: str, req: HumanDecisionRequest):
    if req.decision_type in ["Edit Recommendation", "Reject Recommendation"] and not req.reason.strip():
        raise HTTPException(
            status_code=400,
            detail="A written rationale reason is mandatory when editing or rejecting an AI recommendation."
        )

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    inv_row = cur.fetchone()

    if not inv_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv = dict(inv_row)
    import uuid
    from datetime import datetime

    decision_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now().strftime("%d %b %Y %H:%M")

    cur.execute("""
        INSERT INTO human_decisions (id, invoice_id, decision_type, action, reason, reviewer, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (decision_id, invoice_id, req.decision_type, req.action, req.reason, req.reviewer, now_str))

    new_status = "Resolved" if req.action == "APPROVE" else "Needs Review"
    cur.execute("UPDATE invoices SET status = ? WHERE id = ?", (new_status, invoice_id))
    conn.commit()
    conn.close()

    record = DecisionRecord(
        decision_id=decision_id,
        invoice_id=invoice_id,
        vendor_id=inv["vendor_id"],
        vendor_name=inv["vendor_name"],
        exception_type=inv["exception_type"],
        decision=req.action,
        rationale=req.reason,
        reviewer=req.reviewer,
        source_reference=f"PO {inv['po_number']}",
        timestamp=now_str,
        variance_amount=0.0,
        variance_pct=0.0
    )
    memory_store.retain("comp-1", record)

    return {
        "status": "success",
        "decision_id": decision_id,
        "recorded_action": req.action,
        "memory_retained": True,
        "memory_backend": memory_store.backend_name()
    }

@app.get("/vendors")
def list_vendors():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vendors ORDER BY name ASC")
    vendors = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"vendors": vendors}

@app.get("/vendors/{vendor_id}/profile")
def get_vendor_profile(vendor_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM vendors WHERE id = ?", (vendor_id,))
    v_row = cur.fetchone()
    if not v_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor = dict(v_row)

    cur.execute("SELECT * FROM invoices WHERE vendor_id = ? ORDER BY created_at DESC", (vendor_id,))
    invoices = [dict(r) for r in cur.fetchall()]
    conn.close()

    profile = memory_store.reflect("comp-1", vendor_id)

    return {
        "vendor": vendor,
        "reflection": profile.model_dump(),
        "invoices": invoices,
        "memory_backend": memory_store.backend_name()
    }

@app.get("/insights")
def get_insights():
    results_path = Path("./backend/eval/results.json")
    if results_path.exists():
        try:
            data = json.loads(results_path.read_text(encoding="utf-8"))
            return {
                "mode": "measured",
                "data": data,
                "memory_backend": memory_store.backend_name()
            }
        except Exception:
            pass

    return {
        "mode": "demo",
        "message": "Evaluation results not yet generated. Run 'python -m backend.eval.run_eval'.",
        "memory_backend": memory_store.backend_name()
    }
