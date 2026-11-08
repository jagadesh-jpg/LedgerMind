from decimal import Decimal, ROUND_HALF_UP
import re
from backend.app.models import DocumentItemComparison, ExceptionReport

def quantize_money(amount: Decimal | float) -> Decimal:
    d = Decimal(str(amount))
    return d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def validate_gstin_format(gstin: str) -> bool:
    gstin = gstin.strip().upper()
    # 15 character standard Indian GSTIN format
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(pattern, gstin))

def normalize_invoice_number(inv_num: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]", "", inv_num.upper())
    # strip trailing single letter suffix if separated or at end
    cleaned = re.sub(r"([0-9]+)[A-Z]$", r"\1", cleaned)
    return cleaned

def evaluate_three_way_match(
    item: DocumentItemComparison,
    prior_invoices: list[dict] | None = None,
    gstr2b_invoices: set[str] | None = None,
    current_invoice_id: str = "",
    current_waybill: str = "",
    current_vendor_id: str = ""
) -> ExceptionReport:
    failed_checks: list[str] = []
    passed_checks: list[str] = []

    # 1. Price check against PO
    inv_price = Decimal(str(item.invoice.unit_price))
    po_price = Decimal(str(item.po.unit_price))
    price_delta = inv_price - po_price
    price_variance_pct = Decimal("0.00")
    if po_price > 0:
        price_variance_pct = ((price_delta / po_price) * 100).quantize(Decimal("0.01"))

    # 2. Quantity check against GRN
    inv_qty = Decimal(str(item.invoice.quantity))
    grn_qty = Decimal(str(item.grn.quantity))
    qty_delta = inv_qty - grn_qty
    qty_variance_pct = Decimal("0.00")
    if grn_qty > 0:
        qty_variance_pct = ((qty_delta / grn_qty) * 100).quantize(Decimal("0.01"))

    # 3. Tax / GST checks
    inv_gst_rate = Decimal(str(item.invoice.gst_rate))
    po_gst_rate = Decimal(str(item.po.gst_rate))
    inv_gstin = item.invoice.gstin.strip().upper()
    po_gstin = item.po.gstin.strip().upper()

    # 4. Total Amount calculation
    inv_total = Decimal(str(item.invoice.total_amount))
    po_total = Decimal(str(item.po.total_amount))
    total_delta = inv_total - po_total

    # Perform deterministic validation checks
    # GSTIN format
    if not validate_gstin_format(inv_gstin):
        failed_checks.append("INVALID_GSTIN_FORMAT")
    else:
        passed_checks.append("VALID_GSTIN_FORMAT")

    if inv_gstin != po_gstin:
        failed_checks.append("GSTIN_MISMATCH")
    else:
        passed_checks.append("GSTIN_MATCH")

    if inv_gst_rate != po_gst_rate:
        failed_checks.append("GST_RATE_MISMATCH")
    else:
        passed_checks.append("GST_RATE_MATCH")

    # GSTR-2B presence check
    if gstr2b_invoices is not None:
        if current_invoice_id in gstr2b_invoices:
            passed_checks.append("GSTR2B_VERIFIED")
        else:
            failed_checks.append("GSTR2B_MISSING")

    # Duplicate check
    is_duplicate_waybill = False
    if prior_invoices and current_waybill:
        norm_inv = normalize_invoice_number(current_invoice_id)
        for prev in prior_invoices:
            if prev.get("vendor_id") == current_vendor_id:
                if prev.get("waybill") == current_waybill and prev.get("id") != current_invoice_id:
                    is_duplicate_waybill = True
                    break
    if is_duplicate_waybill:
        failed_checks.append("DUPLICATE_WAYBILL_FLAG")
    else:
        passed_checks.append("WAYBILL_UNIQUE")

    # Quantity check
    if abs(qty_delta) > Decimal("0.001"):
        failed_checks.append("QUANTITY_MISMATCH")
    else:
        passed_checks.append("QUANTITY_MATCH")

    # Price check
    if abs(price_delta) > Decimal("0.01"):
        failed_checks.append("PRICE_MISMATCH")
    else:
        passed_checks.append("PRICE_MATCH")

    # Determine primary exception type
    exception_type = "NONE"
    if is_duplicate_waybill:
        exception_type = "DUPLICATE_SUSPECT"
    elif "INVALID_GSTIN_FORMAT" in failed_checks or "GSTIN_MISMATCH" in failed_checks or "GST_RATE_MISMATCH" in failed_checks or "GSTR2B_MISSING" in failed_checks:
        exception_type = "GST_MISMATCH"
    elif "QUANTITY_MISMATCH" in failed_checks:
        exception_type = "QTY_VARIANCE"
    elif "PRICE_MISMATCH" in failed_checks:
        # Check if it's just minor rounding
        if abs(total_delta) <= Decimal("10.00"):
            exception_type = "ROUNDING_DIFF"
        else:
            exception_type = "PRICE_VARIANCE"

    has_exception = exception_type != "NONE"

    facts = {
        "invoice_unit_price": float(inv_price),
        "po_unit_price": float(po_price),
        "price_delta": float(price_delta),
        "price_variance_pct": float(price_variance_pct),
        "invoice_quantity": float(inv_qty),
        "grn_quantity": float(grn_qty),
        "qty_delta": float(qty_delta),
        "qty_variance_pct": float(qty_variance_pct),
        "invoice_total": float(inv_total),
        "po_total": float(po_total),
        "total_delta": float(total_delta),
        "invoice_gstin": inv_gstin,
        "po_gstin": po_gstin,
        "gst_rate": float(inv_gst_rate),
    }

    return ExceptionReport(
        has_exception=has_exception,
        exception_type=exception_type,
        facts=facts,
        failed_checks=failed_checks,
        passed_checks=passed_checks,
    )
