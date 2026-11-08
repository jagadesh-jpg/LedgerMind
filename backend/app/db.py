import sqlite3
import json
from pathlib import Path

DB_PATH = Path("./ledgermind.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Vendors table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            gstin TEXT NOT NULL,
            payment_terms TEXT,
            policy_summary TEXT
        )
    """)

    # Invoices table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            vendor_id TEXT NOT NULL,
            vendor_name TEXT NOT NULL,
            vendor_category TEXT,
            invoice_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            amount REAL NOT NULL,
            exception_type TEXT NOT NULL,
            status TEXT NOT NULL,
            po_number TEXT NOT NULL,
            grn_number TEXT,
            waybill TEXT,
            confidence_score REAL DEFAULT 0.95,
            notes TEXT,
            raw_comparison_json TEXT,
            stream_split TEXT DEFAULT 'stream', -- 'stream' or 'holdout'
            ground_truth_action TEXT,
            ground_truth_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        )
    """)

    # Human Decisions table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS human_decisions (
            id TEXT PRIMARY KEY,
            invoice_id TEXT NOT NULL,
            decision_type TEXT NOT NULL,
            action TEXT NOT NULL,
            reason TEXT NOT NULL,
            reviewer TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        )
    """)

    conn.commit()
    conn.close()
