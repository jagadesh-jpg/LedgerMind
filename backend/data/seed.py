import json
from pathlib import Path
from backend.app.db import get_connection, init_db
from backend.data.generator import generate_dataset
from backend.app.memory import LocalMemory
from backend.app.models import DecisionRecord

def seed():
    init_db()
    vendors, invoices, gstr2b_list = generate_dataset()

    data_dir = Path(__file__).parent
    gstr_file = data_dir / "gstr2b.json"
    gstr_file.write_text(json.dumps(gstr2b_list, indent=2), encoding="utf-8")

    conn = get_connection()
    cur = conn.cursor()

    # Clear existing data for idempotent runs
    cur.execute("DELETE FROM invoices")
    cur.execute("DELETE FROM vendors")

    # Insert vendors
    for v in vendors:
        cur.execute("""
            INSERT OR REPLACE INTO vendors (id, name, category, gstin, payment_terms, policy_summary)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (v["id"], v["name"], v["category"], v["gstin"], v["terms"], v["policy"]))

    # Insert invoices
    for inv in invoices:
        cur.execute("""
            INSERT OR REPLACE INTO invoices (
                id, vendor_id, vendor_name, vendor_category, invoice_date, due_date,
                amount, exception_type, status, po_number, grn_number, waybill,
                confidence_score, notes, stream_split, ground_truth_action, ground_truth_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inv["id"], inv["vendor_id"], inv["vendor_name"], inv["vendor_category"],
            inv["invoice_date"], inv["due_date"], inv["amount"], inv["exception_type"],
            inv["status"], inv["po_number"], inv["grn_number"], inv["waybill"],
            inv["confidence_score"], inv["notes"], inv["stream_split"],
            inv["ground_truth_action"], inv["ground_truth_reason"]
        ))

    conn.commit()
    conn.close()

    # Seed initial memories into LocalMemory for the top vendors
    mem = LocalMemory()
    initial_memories = [
        DecisionRecord(
            decision_id="MEM-2026-041",
            invoice_id="INV-2026-8941",
            vendor_id="VEND-TATA",
            vendor_name="Tata Steel Tubes & Pipes",
            exception_type="PRICE_VARIANCE",
            decision="APPROVE",
            rationale="A price variance of ₹1,200 per MT on structural tubing was accepted after verifying Ministry of Steel scrap index surcharge addendum.",
            reviewer="Ramesh Sundaram (AP Controller)",
            source_reference="PO-65120 / Surcharge Addendum #TS-2026-Q2",
            timestamp="14 Aug 2026",
            variance_amount=240000.0,
            variance_pct=4.8
        ),
        DecisionRecord(
            decision_id="MEM-2026-019",
            invoice_id="INV-2026-8941",
            vendor_id="VEND-TATA",
            vendor_name="Tata Steel Tubes & Pipes",
            exception_type="PRICE_VARIANCE",
            decision="REQUEST_CREDIT_NOTE",
            rationale="Unilateral freight escalation of ₹950 per MT exceeded tolerance. Tata Steel issued Credit Note #CN-8812.",
            reviewer="Anand Kumar (AP Lead)",
            source_reference="Dispute Ticket #DT-902 / CN-8812",
            timestamp="02 Feb 2026",
            variance_amount=190000.0,
            variance_pct=8.5
        ),
        DecisionRecord(
            decision_id="MEM-2026-081",
            invoice_id="INV-2026-8929",
            vendor_id="VEND-SCHNEIDER",
            vendor_name="Schneider Electric India",
            exception_type="QTY_VARIANCE",
            decision="REQUEST_CREDIT_NOTE",
            rationale="Partial shipment received (30 of 40 units). Vendor agreed to invoice only received quantity or provide credit note.",
            reviewer="Anand Kumar (AP Lead)",
            source_reference="PO-61099 / Dispatch Advice #DA-441",
            timestamp="28 Jul 2026",
            variance_amount=125600.0,
            variance_pct=25.0
        ),
        DecisionRecord(
            decision_id="MEM-2026-012",
            invoice_id="INV-2026-8935",
            vendor_id="VEND-BLUEDART",
            vendor_name="BlueDart Air Express",
            exception_type="DUPLICATE_SUSPECT",
            decision="HOLD_PAYMENT",
            rationale="Waybill docket was submitted in duplicate across regional dispatch files. Flagged and payment withheld.",
            reviewer="Anand Kumar (AP Lead)",
            source_reference="Audit Log #AL-2026-01",
            timestamp="10 Jan 2026",
            variance_amount=94600.0,
            variance_pct=0.0
        )
    ]

    for m in initial_memories:
        mem.retain("comp-1", m)

    print("Seed complete: 15 vendors, 300 invoices, initial local memory records populated.")

if __name__ == "__main__":
    seed()
