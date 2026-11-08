# LedgerMind Architecture Documentation

## 1. System Overview
LedgerMind is an enterprise Accounts Payable (AP) Exception Management agent designed for high-precision invoice reconciliation. It pairs deterministic financial computation with contextual memory (Hindsight by Vectorize / Local fallback) and human-in-the-loop review governance.

```
React (Vite 6 SPA)  ──HTTP (REST / CORS)──▶  FastAPI Backend (:8000)
                                                    │
        ┌───────────────────────────────────────────┼─────────────────────────────────┐
        ▼                                           ▼                                 ▼
Deterministic Rules Engine                  Memory Store Adapter                Decision Agent
- 3-Way Reconciliation (PO vs GRN vs Inv)   ├─ HindsightMemory (Vectorize API)  - Groq LLM Reasoning
- Exact Arithmetic (Decimal money, GST)     └─ LocalMemory (SQLite fallback)    - JSON Pydantic Validation
- Waybill Duplicate Detection                       │                                 │
        └─────────────────────────────────▶  Guardrails Engine  ◀─────────────────────┘
                                                    │
                                              SQLite Database
                                   (Invoices, Vendors, Decisions, Audit)
```

## 2. Core Components

### A. Pure Python Rules Engine (`backend/app/rules_engine.py`)
- **Deterministic Math:** Computes unit price differences, quantity shortages, applicable GST rates, and total variance using Python's `Decimal` module. LLMs never calculate financial arithmetic.
- **Verification Criteria:**
  - 3-way matching between Purchase Order, Goods Receipt Note (GRN), and Supplier Tax Invoice.
  - Indian GSTIN format and state code verification.
  - GSTR-2B compliance check.
  - Normalized duplicate docket and waybill hash checking.

### B. Memory Layer (`backend/app/memory.py`)
- **Hindsight Memory (Official Vectorize Client):** Retains human decision rationales into company-isolated memory banks (`{company_id}-ap`), recalls historical precedents by query, and generates synthesized vendor reflection profiles (`reflect`).
- **Local Memory (Deterministic SQLite Fallback):** Ensures 100% offline functionality, testability, and fast baseline comparisons.

### C. Decision Agent & Guardrails (`backend/app/agent.py` & `backend/app/guardrails.py`)
- **Groq LLM Reasoning:** Primary model `openai/gpt-oss-120b`, fallback model `qwen/qwen3-32b`. Prompt contains pre-computed facts and numbered recalled memories.
- **Strict Guardrails:**
  - Hard Rules: Invalid GSTIN or duplicate waybill forces `HOLD_PAYMENT` regardless of memory. High-value invoices (> ₹10,00,000) force `ESCALATE`.
  - Evidence Gate: If fewer than 2 relevant memories exist, action defaults to `ESCALATE` with Low confidence.
  - Conflict Check: Contradictory precedents trigger `conflict: true` and escalate to senior reviewers.
  - Human in the Loop: The agent only recommends. Real disbursements and approvals remain guarded.

## 3. Data Persistence & SQLite Schema
- `vendors`: Vendor profiles, GSTINs, payment terms, and ground-truth policy summaries.
- `invoices`: Invoices with line items, PO numbers, GRN references, status, and stream split.
- `human_decisions`: Comprehensive audit log recording reviewer name, decision type, action, and mandatory written rationales.

