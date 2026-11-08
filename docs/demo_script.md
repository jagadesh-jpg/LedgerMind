# LedgerMind 3-5 Minute Live Demonstration Script

## Step 1: System Overview & Startup
1. Open PowerShell and run:
   ```powershell
   .\scripts\dev.ps1
   ```
2. Navigate to `http://localhost:5173/` in your browser.
3. Show the **Overview Dashboard**:
   - Point out the 4 KPI cards with real-time database counts (1,428 volume, 84 pending review, 38 open exceptions).
   - Point out the active backend indicator: `"Memory: local"` or `"Memory: hindsight"`.

## Step 2: Day-1 Cold Start Escalation
1. Navigate to **Invoice Queue** (`/invoices`).
2. Filter by status: `Needs Review`.
3. Click on invoice `INV-2026-8941` (Tata Steel Tubes & Pipes).
4. Review the **Invoice Facts Panel**:
   - Show the deterministic 3-way match: PO rate (₹6,100) vs Invoice rate (₹7,500) -> Delta: +₹1,400/unit (+22.9%).
5. Review the **AI Recommendation**:
   - Point out the suggested action: `Request Clarification` or `Escalate`.
   - Explain the **Evidence Gate**: The agent doesn't guess when evidence is scarce; it asks for human guidance.

## Step 3: Human Review & Decision Retention
1. Scroll to the **Human Decision Dialog**.
2. Select **Accept Recommendation** or **Edit Recommendation**.
3. If editing, demonstrate the validation: leaving the rationale blank is rejected.
4. Enter rationale: *"Approved after verifying Ministry of Steel scrap index addendum for Q2."*
5. Click **Proceed to Confirmation** -> **Confirm & Record Decision**.
6. Show immediate visual confirmation: Decision is persisted and retained in Hindsight / memory store.

## Step 4: Contextual Memory Recall on Subsequent Invoices
1. Inspect the **Vendor Memory Trail** panel:
   - Show that the newly recorded human rationale is immediately indexed and visible for Tata Steel.
2. The next time a similar price variance occurs, the AI recommendation cites this precedent with high confidence.

## Step 5: Memory Insights & Evaluation Curve
1. Navigate to **Memory Insights** (`/memory-insights`).
2. Show the **Weekly Recommendation Acceptance Rate** chart:
   - **With Memory:** Precision rises from 31% in Week 1 to 84-95% in Week 8 as the agent learns reviewer policies.
   - **Without Memory:** Remains flat at ~28-31% baseline.
   - Point out **False Approvals: 0%** (zero compliance breach).
3. Review the **Needs a Human Check** card for Schneider Electric:
   - Click **Review the Conflict** and resolve the precedent ambiguity in the interactive modal.

