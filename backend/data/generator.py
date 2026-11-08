import random
import json
from decimal import Decimal
from datetime import datetime, timedelta
from pathlib import Path

# Deterministic Seed
random.seed(42)

VENDORS = [
    {
        "id": "VEND-TATA",
        "name": "Tata Steel Tubes & Pipes",
        "category": "Raw Materials",
        "gstin": "27AAACT2727Q1ZW",
        "terms": "Net 30",
        "policy_type": "surcharge_tolerance",
        # Policy: price variance <= 5% or documented scrap surcharge addendum approved, otherwise hold
        "policy": "Price variance up to 5% is approved per quarterly index surcharge agreement; above 5% require credit note or hold."
    },
    {
        "id": "VEND-INFOSYS",
        "name": "Infosys Cloud Operations",
        "category": "IT & Software",
        "gstin": "29AAACI1234K1ZV",
        "terms": "Net 15",
        "policy_type": "clean_matching",
        "policy": "SLA-verified SaaS services. Clean 3-way match is approved as is."
    },
    {
        "id": "VEND-BLUEDART",
        "name": "BlueDart Air Express",
        "category": "Freight & Logistics",
        "gstin": "27AAACB0001Z1ZR",
        "terms": "Net 30",
        "policy_type": "waybill_duplicate_check",
        "policy": "Suffix invoices (-A/-B) are split legs and approved; identical waybill dockets are rejected duplicates."
    },
    {
        "id": "VEND-SCHNEIDER",
        "name": "Schneider Electric India",
        "category": "Facility & Equipment",
        "gstin": "27AAACS1414P1ZM",
        "terms": "Net 45",
        "policy_type": "partial_delivery_tolerance",
        "policy": "Partial delivery shortfalls < 10% approve payment for actual GRN count; >= 10% shortfall request credit note."
    },
    {
        "id": "VEND-APOLLO",
        "name": "Apollo Tyres Commercial",
        "category": "Fleet Spares",
        "gstin": "32AAACA0999K1ZM",
        "terms": "Net 30",
        "policy_type": "rounding_tolerance",
        "policy": "Rounding differences under ₹10 are approved without dispute."
    },
    {
        "id": "VEND-GODREJ",
        "name": "Godrej Storage Solutions",
        "category": "Warehouse Infrastructure",
        "gstin": "27AAACG1920L1ZM",
        "terms": "Net 30",
        "policy_type": "missing_doc_check",
        "policy": "Missing supplemental transport docket: ask vendor before approving."
    },
    {
        "id": "VEND-LT",
        "name": "Larsen & Toubro Valves",
        "category": "Capital Equipment",
        "gstin": "27AAACL1212B1ZW",
        "terms": "Net 60",
        "policy_type": "high_value_escalation",
        "policy": "Capital equipment invoices over ₹10,00,000 must escalate to Finance Controller."
    },
    {
        "id": "VEND-RELIANCE",
        "name": "Reliance Petrochemicals India",
        "category": "Polymers & Resin",
        "gstin": "24AAACR5555Q1ZM",
        "terms": "Net 30",
        "policy_type": "gstr2b_reconciliation",
        "policy": "Hold payment until invoice is reflected in GSTR-2B filing portal."
    },
    {
        "id": "VEND-WIPRO",
        "name": "Wipro Facility Management",
        "category": "Office Admin & Maintenance",
        "gstin": "29AAACW8888P1ZR",
        "terms": "Net 30",
        "policy_type": "manpower_variance",
        "policy": "Service hours variance within 3% approved; above 3% request revised timesheet."
    },
    {
        "id": "VEND-BHARAT",
        "name": "Bharat Petroleum Industrial Lubricants",
        "category": "Lubricants & Fuel",
        "gstin": "27AAACB3333F1ZW",
        "terms": "Immediate",
        "policy_type": "fuel_surcharge",
        "policy": "Price variance matching fortnightly PSU fuel price index is approved."
    },
    {
        "id": "VEND-HINDALCO",
        "name": "Hindalco Aluminium Extrusions",
        "category": "Metals & Smelting",
        "gstin": "23AAACH4444M1ZM",
        "terms": "Net 30",
        "policy_type": "weight_moisture_tolerance",
        "policy": "Weight tolerance variance up to 2% moisture loss approved."
    },
    {
        "id": "VEND-SIEMENS",
        "name": "Siemens Process Instrumentation",
        "category": "Automation & Sensors",
        "gstin": "27AAACS9999K1ZM",
        "terms": "Net 45",
        "policy_type": "customs_duty_markup",
        "policy": "Imported component exchange rate variance up to 3% approved."
    },
    {
        "id": "VEND-HAVELLS",
        "name": "Havells Industrial Switchgear",
        "category": "Electricals",
        "gstin": "07AAACH1111Q1ZW",
        "terms": "Net 30",
        "policy_type": "bulk_discount_check",
        "policy": "Ensure 5% volume rebate is applied on batches above 100 units."
    },
    {
        "id": "VEND-MAHINDRA",
        "name": "Mahindra Commercial Fleet Logistics",
        "category": "Transport & Haulage",
        "gstin": "27AAACM7777D1ZW",
        "terms": "Net 15",
        "policy_type": "detention_charges",
        "policy": "Detention charges over 24 hours require warehouse gate sign-off."
    },
    {
        "id": "VEND-ITC",
        "name": "ITC Packaging & Printing Solutions",
        "category": "Packaging Materials",
        "gstin": "19AAACI2222J1ZM",
        "terms": "Net 30",
        "policy_type": "cylinder_plate_charge",
        "policy": "One-time plate prep charges require prior purchase order inclusion."
    }
]

def generate_dataset():
    invoices = []
    gstr2b_set = set()

    start_date = datetime(2026, 8, 1)

    # 1. First include the 7 exact UI mock invoices so the frontend data matches 100%
    known_mock_invoices = [
        {
            "id": "INV-2026-8941",
            "vendor_id": "VEND-TATA",
            "vendor_name": "Tata Steel Tubes & Pipes",
            "vendor_category": "Raw Materials",
            "invoice_date": "07 Nov 2026",
            "due_date": "22 Nov 2026",
            "amount": 1450000,
            "exception_type": "PRICE_VARIANCE",
            "status": "Needs Review",
            "po_number": "PO-77491",
            "grn_number": "GRN-44912",
            "waybill": "WB-990141",
            "confidence_score": 0.94,
            "notes": "Base rate per metric ton differs by ₹1,400 from agreed contracted tariff in PO-77491.",
            "ground_truth_action": "HOLD_PAYMENT",
            "ground_truth_reason": "Variance of 22.9% exceeds 5% contractual index surcharge threshold without verified addendum.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8938",
            "vendor_id": "VEND-INFOSYS",
            "vendor_name": "Infosys Cloud Operations",
            "vendor_category": "IT & Software",
            "invoice_date": "06 Nov 2026",
            "due_date": "20 Nov 2026",
            "amount": 382400,
            "exception_type": "NONE",
            "status": "Resolved",
            "po_number": "PO-65219",
            "grn_number": "GRN-44900",
            "waybill": "WB-990138",
            "confidence_score": 0.99,
            "notes": "Three-way match completed with service delivery ticket #7841.",
            "ground_truth_action": "APPROVE",
            "ground_truth_reason": "Clean 3-way match across PO, GRN and invoice.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8935",
            "vendor_id": "VEND-BLUEDART",
            "vendor_name": "BlueDart Air Express",
            "vendor_category": "Freight & Logistics",
            "invoice_date": "06 Nov 2026",
            "due_date": "15 Nov 2026",
            "amount": 94600,
            "exception_type": "DUPLICATE_SUSPECT",
            "status": "Needs Review",
            "po_number": "PO-88120",
            "grn_number": "GRN-44780",
            "waybill": "WB-BD9041",
            "confidence_score": 0.88,
            "notes": "Identical waybill numbers detected on previously settled docket #BD-9041.",
            "ground_truth_action": "HOLD_PAYMENT",
            "ground_truth_reason": "Identical waybill docket #BD-9041 detected on previously settled disbursement.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8929",
            "vendor_id": "VEND-SCHNEIDER",
            "vendor_name": "Schneider Electric India",
            "vendor_category": "Facility & Equipment",
            "invoice_date": "05 Nov 2026",
            "due_date": "30 Nov 2026",
            "amount": 628000,
            "exception_type": "QTY_VARIANCE",
            "status": "Needs Review",
            "po_number": "PO-71043",
            "grn_number": "GRN-44810",
            "waybill": "WB-990129",
            "confidence_score": 0.92,
            "notes": "GRN indicates receipt of 40 distribution units, invoice claims 50 units.",
            "ground_truth_action": "REQUEST_CREDIT_NOTE",
            "ground_truth_reason": "20% quantity shortfall exceeds 10% partial delivery tolerance; vendor must credit back 10 units.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8924",
            "vendor_id": "VEND-APOLLO",
            "vendor_name": "Apollo Tyres Commercial",
            "vendor_category": "Fleet Spares",
            "invoice_date": "04 Nov 2026",
            "due_date": "19 Nov 2026",
            "amount": 215000,
            "exception_type": "NONE",
            "status": "Processing",
            "po_number": "PO-69102",
            "grn_number": "GRN-44700",
            "waybill": "WB-990124",
            "confidence_score": 0.96,
            "notes": "Document OCR extracted. Awaiting automated ERP receipt cross-reference.",
            "ground_truth_action": "APPROVE",
            "ground_truth_reason": "Pricing and tire dispatch count match contracted master fleet schedule.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8917",
            "vendor_id": "VEND-GODREJ",
            "vendor_name": "Godrej Storage Solutions",
            "vendor_category": "Warehouse Infrastructure",
            "invoice_date": "03 Nov 2026",
            "due_date": "18 Nov 2026",
            "amount": 792500,
            "exception_type": "MISSING_INFO",
            "status": "Needs Review",
            "po_number": "PO-76290",
            "grn_number": "GRN-44650",
            "waybill": "WB-990117",
            "confidence_score": 0.85,
            "notes": "Missing Vendor GSTIN on supplemental transport attachment.",
            "ground_truth_action": "ASK_VENDOR",
            "ground_truth_reason": "Missing transportation invoice GSTIN schedule; ask vendor for tax annexure.",
            "stream_split": "stream"
        },
        {
            "id": "INV-2026-8912",
            "vendor_id": "VEND-LT",
            "vendor_name": "Larsen & Toubro Valves",
            "vendor_category": "Capital Equipment",
            "invoice_date": "02 Nov 2026",
            "due_date": "17 Dec 2026",
            "amount": 3240000,
            "exception_type": "NONE",
            "status": "Needs Review",
            "po_number": "PO-80124",
            "grn_number": "GRN-44600",
            "waybill": "WB-990112",
            "confidence_score": 0.98,
            "notes": "Awaiting human review by AP Lead prior to scheduled disbursement.",
            "ground_truth_action": "ESCALATE",
            "ground_truth_reason": "High-value milestone invoice (> ₹10,00,000) requires formal Finance Controller sign-off.",
            "stream_split": "stream"
        }
    ]

    for m in known_mock_invoices:
        invoices.append(m)
        gstr2b_set.add(m["id"])

    # Generate up to ~300 invoices total (200 stream, 100 hold-out)
    total_needed = 300 - len(invoices)
    current_date = start_date

    for i in range(1, total_needed + 1):
        v = VENDORS[i % len(VENDORS)]
        inv_id = f"INV-2026-{1000 + i}"
        po_num = f"PO-{50000 + (i % 800)}"
        grn_num = f"GRN-{30000 + (i % 800)}"
        waybill_num = f"WB-{70000 + (i % 600)}"
        current_date += timedelta(hours=7)
        date_str = current_date.strftime("%d %b %Y")
        due_str = (current_date + timedelta(days=30)).strftime("%d %b %Y")

        # 80% clean, 20% exceptions
        is_exception = (i % 5 == 0)
        split = "stream" if i <= 193 else "holdout"

        base_qty = random.choice([10, 20, 50, 100, 200, 500])
        base_rate = random.choice([250, 450, 800, 1200, 2500, 6000, 15000])

        if not is_exception:
            amount = int(base_qty * base_rate * 1.18)
            invoices.append({
                "id": inv_id,
                "vendor_id": v["id"],
                "vendor_name": v["name"],
                "vendor_category": v["category"],
                "invoice_date": date_str,
                "due_date": due_str,
                "amount": amount,
                "exception_type": "NONE",
                "status": "Resolved",
                "po_number": po_num,
                "grn_number": grn_num,
                "waybill": waybill_num,
                "confidence_score": round(random.uniform(0.95, 0.99), 2),
                "notes": "3-way match verified.",
                "ground_truth_action": "APPROVE",
                "ground_truth_reason": "Clean 3-way match with purchase order and physical goods receipt.",
                "stream_split": split
            })
            gstr2b_set.add(inv_id)
        else:
            # Inject exception based on vendor's hidden policy
            pt = v["policy_type"]
            if pt == "surcharge_tolerance":
                # Price variance
                var_pct = random.choice([3.5, 7.5])
                inv_rate = int(base_rate * (1 + var_pct / 100))
                amount = int(base_qty * inv_rate * 1.18)
                action = "APPROVE" if var_pct <= 5.0 else "HOLD_PAYMENT"
                reason = "Variance within 5% index tolerance" if var_pct <= 5.0 else "Variance > 5% without index surcharge circular"
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "PRICE_VARIANCE",
                    "status": "Needs Review",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": waybill_num,
                    "confidence_score": 0.92,
                    "notes": f"Unit rate differs from PO contract ({var_pct}% variance).",
                    "ground_truth_action": action,
                    "ground_truth_reason": reason,
                    "stream_split": split
                })
                gstr2b_set.add(inv_id)

            elif pt == "partial_delivery_tolerance":
                # Quantity variance
                shortfall_pct = random.choice([5.0, 15.0])
                inv_qty = base_qty
                amount = int(inv_qty * base_rate * 1.18)
                action = "APPROVE" if shortfall_pct < 10.0 else "REQUEST_CREDIT_NOTE"
                reason = "Delivery shortfall < 10% approved for received GRN" if shortfall_pct < 10.0 else "Delivery shortfall >= 10% requires formal credit note"
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "QTY_VARIANCE",
                    "status": "Needs Review",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": waybill_num,
                    "confidence_score": 0.91,
                    "notes": f"GRN indicates short delivery ({shortfall_pct}% shortfall).",
                    "ground_truth_action": action,
                    "ground_truth_reason": reason,
                    "stream_split": split
                })
                gstr2b_set.add(inv_id)

            elif pt == "waybill_duplicate_check":
                # Duplicate docket
                amount = int(base_qty * base_rate * 1.18)
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "DUPLICATE_SUSPECT",
                    "status": "Needs Review",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": "WB-BD9041", # Duplicate waybill
                    "confidence_score": 0.87,
                    "notes": "Waybill sequence previously claimed on prior docket.",
                    "ground_truth_action": "HOLD_PAYMENT",
                    "ground_truth_reason": "Identical waybill detected on previous settlement.",
                    "stream_split": split
                })

            elif pt == "gstr2b_reconciliation":
                # GST mismatch (missing in GSTR-2B)
                amount = int(base_qty * base_rate * 1.18)
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "GST_MISMATCH",
                    "status": "Needs Review",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": waybill_num,
                    "confidence_score": 0.89,
                    "notes": "Invoice not yet reflected in vendor GSTR-2B filing.",
                    "ground_truth_action": "HOLD_PAYMENT",
                    "ground_truth_reason": "Missing from GSTR-2B portal; input tax credit cannot be claimed.",
                    "stream_split": split
                })
                # DO NOT add to gstr2b_set

            elif pt == "rounding_tolerance":
                # Small rounding difference
                amount = int(base_qty * base_rate * 1.18) + 6 # +₹6
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "ROUNDING_DIFF",
                    "status": "Processing",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": waybill_num,
                    "confidence_score": 0.98,
                    "notes": "₹6 net rounding variance on tax fraction.",
                    "ground_truth_action": "APPROVE",
                    "ground_truth_reason": "Rounding difference <= ₹10 accepted as immaterial fractional variance.",
                    "stream_split": split
                })
                gstr2b_set.add(inv_id)

            else:
                # High value or generic escalation
                amount = 1450000
                invoices.append({
                    "id": inv_id,
                    "vendor_id": v["id"],
                    "vendor_name": v["name"],
                    "vendor_category": v["category"],
                    "invoice_date": date_str,
                    "due_date": due_str,
                    "amount": amount,
                    "exception_type": "PRICE_VARIANCE",
                    "status": "Needs Review",
                    "po_number": po_num,
                    "grn_number": grn_num,
                    "waybill": waybill_num,
                    "confidence_score": 0.90,
                    "notes": "High-value invoice variance requires leadership sign-off.",
                    "ground_truth_action": "ESCALATE",
                    "ground_truth_reason": "High-value invoice exceeding ₹10,00,000 threshold requires Finance Controller approval.",
                    "stream_split": split
                })
                gstr2b_set.add(inv_id)

    # Sort invoices deterministically by date
    return VENDORS, invoices, sorted(list(gstr2b_set))

if __name__ == "__main__":
    v, inv, gstr = generate_dataset()
    print(f"Generated {len(v)} vendors, {len(inv)} invoices ({sum(1 for x in inv if x['stream_split']=='stream')} stream, {sum(1 for x in inv if x['stream_split']=='holdout')} holdout).")
    print(f"GSTR-2B contains {len(gstr)} verified invoices.")
