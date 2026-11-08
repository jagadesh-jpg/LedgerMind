import pytest
from decimal import Decimal
from backend.app.models import DocumentItemComparison, LineItemPO, LineItemGRN, LineItemInvoice
from backend.app.rules_engine import (
    quantize_money, validate_gstin_format, normalize_invoice_number, evaluate_three_way_match
)

def make_test_item(
    po_qty=100, po_price=1000, po_gst=18, po_gstin="27AAACT2727Q1ZW",
    grn_qty=100, grn_price=1000,
    inv_qty=100, inv_price=1000, inv_gst=18, inv_gstin="27AAACT2727Q1ZW"
) -> DocumentItemComparison:
    po_total = Decimal(str(po_qty * po_price * (1 + po_gst / 100)))
    grn_total = Decimal(str(grn_qty * grn_price))
    inv_total = Decimal(str(inv_qty * inv_price * (1 + inv_gst / 100)))

    return DocumentItemComparison(
        line_item_id="LINE-001",
        item_description="Test Item",
        po=LineItemPO(
            item_description="Test Item",
            quantity=Decimal(str(po_qty)),
            unit_price=Decimal(str(po_price)),
            total_amount=po_total,
            gst_rate=Decimal(str(po_gst)),
            gstin=po_gstin
        ),
        grn=LineItemGRN(
            grn_number="GRN-001",
            quantity=Decimal(str(grn_qty)),
            unit_price=Decimal(str(grn_price)),
            total_amount=grn_total,
            received_date="01 Nov 2026"
        ),
        invoice=LineItemInvoice(
            quantity=Decimal(str(inv_qty)),
            unit_price=Decimal(str(inv_price)),
            total_amount=inv_total,
            gst_rate=Decimal(str(inv_gst)),
            gstin=inv_gstin
        )
    )

def test_clean_3_way_match():
    item = make_test_item()
    report = evaluate_three_way_match(item)
    assert not report.has_exception
    assert report.exception_type == "NONE"
    assert "PRICE_MATCH" in report.passed_checks
    assert "QUANTITY_MATCH" in report.passed_checks

def test_price_variance():
    item = make_test_item(inv_price=1200)
    report = evaluate_three_way_match(item)
    assert report.has_exception
    assert report.exception_type == "PRICE_VARIANCE"
    assert "PRICE_MISMATCH" in report.failed_checks
    assert report.facts["price_delta"] == 200.0

def test_quantity_variance():
    item = make_test_item(grn_qty=80, inv_qty=100)
    report = evaluate_three_way_match(item)
    assert report.has_exception
    assert report.exception_type == "QTY_VARIANCE"
    assert "QUANTITY_MISMATCH" in report.failed_checks

def test_invalid_gstin_format():
    item = make_test_item(inv_gstin="INVALID_GSTIN_123")
    report = evaluate_three_way_match(item)
    assert report.has_exception
    assert "INVALID_GSTIN_FORMAT" in report.failed_checks

def test_valid_gstin_format():
    assert validate_gstin_format("27AAACT2727Q1ZW") is True
    assert validate_gstin_format("36AABCT1234F1Z5") is True
    assert validate_gstin_format("12345") is False

def test_gstin_mismatch():
    item = make_test_item(po_gstin="27AAACT2727Q1ZW", inv_gstin="29AAACI1234K1ZV")
    report = evaluate_three_way_match(item)
    assert report.has_exception
    assert "GSTIN_MISMATCH" in report.failed_checks

def test_gst_rate_mismatch():
    item = make_test_item(po_gst=18, inv_gst=12)
    report = evaluate_three_way_match(item)
    assert report.has_exception
    assert "GST_RATE_MISMATCH" in report.failed_checks

def test_rounding_difference_immaterial():
    item = make_test_item(po_price=1000, inv_price=1000.04, po_qty=100, inv_qty=100)
    report = evaluate_three_way_match(item)
    assert report.exception_type == "ROUNDING_DIFF"

def test_duplicate_waybill_detection():
    item = make_test_item()
    priors = [{"id": "INV-PREV-01", "vendor_id": "VEND-1", "waybill": "WB-9901"}]
    report = evaluate_three_way_match(
        item,
        prior_invoices=priors,
        current_invoice_id="INV-CURR-02",
        current_waybill="WB-9901",
        current_vendor_id="VEND-1"
    )
    assert report.has_exception
    assert report.exception_type == "DUPLICATE_SUSPECT"
    assert "DUPLICATE_WAYBILL_FLAG" in report.failed_checks

def test_normalize_invoice_number():
    assert normalize_invoice_number("INV-2026/001-A") == "INV2026001"
    assert normalize_invoice_number("inv 2026 8941") == "INV20268941"

# 15 additional comprehensive tests for edge cases and deterministic math:

def test_zero_quantity_handling():
    item = make_test_item(po_qty=0, grn_qty=0, inv_qty=0)
    report = evaluate_three_way_match(item)
    assert report.facts["qty_delta"] == 0.0

def test_negative_price_variance_discount():
    # Supplier charged less than PO contracted rate
    item = make_test_item(po_price=1000, inv_price=900)
    report = evaluate_three_way_match(item)
    assert report.facts["price_delta"] == -100.0
    assert report.facts["price_variance_pct"] == -10.0

def test_missing_grn_zero_received():
    item = make_test_item(po_qty=50, grn_qty=0, inv_qty=50)
    report = evaluate_three_way_match(item)
    assert "QUANTITY_MISMATCH" in report.failed_checks
    assert report.facts["qty_delta"] == 50.0

def test_high_quantity_over_shipment():
    item = make_test_item(po_qty=100, grn_qty=100, inv_qty=125)
    report = evaluate_three_way_match(item)
    assert report.facts["qty_variance_pct"] == 25.0

def test_gstin_case_insensitivity():
    item = make_test_item(po_gstin="27aaact2727q1zw", inv_gstin="27AAACT2727Q1ZW")
    report = evaluate_three_way_match(item)
    assert "GSTIN_MATCH" in report.passed_checks

def test_telangana_state_code_gstin():
    assert validate_gstin_format("36AABCT1234F1Z5") is True

def test_karnataka_state_code_gstin():
    assert validate_gstin_format("29AAACI1234K1ZV") is True

def test_delhi_state_code_gstin():
    assert validate_gstin_format("07AAACH1111Q1ZW") is True

def test_invalid_characters_gstin():
    assert validate_gstin_format("27AAACT2727Q!ZW") is False
    assert validate_gstin_format("27AAACT2727Q1Z") is False # 14 chars

def test_gstr2b_presence_success():
    item = make_test_item()
    report = evaluate_three_way_match(item, gstr2b_invoices={"INV-100"}, current_invoice_id="INV-100")
    assert "GSTR2B_VERIFIED" in report.passed_checks

def test_gstr2b_presence_failure():
    item = make_test_item()
    report = evaluate_three_way_match(item, gstr2b_invoices={"INV-200"}, current_invoice_id="INV-100")
    assert "GSTR2B_MISSING" in report.failed_checks

def test_quantize_money_rounding():
    assert quantize_money(125.456) == Decimal("125.46")
    assert quantize_money(125.454) == Decimal("125.45")

def test_rounding_diff_threshold_boundary():
    # 10 units in PO, GRN and invoice; unit price differs slightly (total delta <= ₹10.00)
    item = make_test_item(po_price=100, grn_price=100, inv_price=100.50, po_qty=10, grn_qty=10, inv_qty=10)
    report = evaluate_three_way_match(item)
    assert report.exception_type == "ROUNDING_DIFF"

def test_rounding_diff_exceeded():
    # Total delta > ₹10.00 becomes PRICE_VARIANCE
    item = make_test_item(po_price=100, grn_price=100, inv_price=102.00, po_qty=10, grn_qty=10, inv_qty=10)
    report = evaluate_three_way_match(item)
    assert report.exception_type == "PRICE_VARIANCE"

def test_duplicate_check_different_vendor_same_waybill_ignored():
    item = make_test_item()
    priors = [{"id": "INV-PREV-01", "vendor_id": "VEND-OTHER", "waybill": "WB-9901"}]
    report = evaluate_three_way_match(
        item,
        prior_invoices=priors,
        current_invoice_id="INV-CURR-02",
        current_waybill="WB-9901",
        current_vendor_id="VEND-1"
    )
    assert "WAYBILL_UNIQUE" in report.passed_checks
