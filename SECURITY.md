# Security Policy & Governance

## 1. Secrets Management
- **No Secrets in Code:** Private API keys (`GROQ_API_KEY`, `HINDSIGHT_API_KEY`) must never be hardcoded, printed, or committed.
- **Environment Isolation:** Secrets are loaded strictly via `backend/.env` using Pydantic Settings. `backend/.env` is tracked in `.gitignore` and excluded from git tracking.
- **Frontend Safety:** The frontend communicates with the FastAPI backend over HTTP. **No `VITE_` variable may ever hold an API secret** because all `VITE_` variables are bundled into the client browser application.

## 2. Leak Response Protocol (Revoke First, Then Rotate)
If a secret or credential is inadvertently exposed in git history or logs:
1. **REVOKE FIRST:** Immediately navigate to the provider dashboard ([Groq Console](https://console.groq.com) or [Vectorize Console](https://vectorize.io)) and **revoke/delete the exposed key** immediately. Do not merely commit an overwrite; an active key in git history is compromised.
2. **ROTATE:** Generate a fresh replacement key.
3. **UPDATE LOCAL ENVIRONMENT:** Update `backend/.env` with the new key.
4. **PURGE GIT HISTORY:** If committed, use `git filter-repo` or BFG Repo-Cleaner to permanently scrub the revision from the repository history before pushing.

## 3. Synthetic Data Notice
- **All Data is Synthetic:** All 15 vendors, 300 invoices, purchase orders, goods receipt notes (GRN), and GSTR-2B tax records in this project are synthetically generated for hackathon benchmarking.
- No genuine commercial vendor records, private banking information, real PANs, or actual enterprise disbursements are stored or processed.

## 4. Pre-commit Hook Installation
To run secret scanning automatically before every git commit:
```powershell
pip install pre-commit
pre-commit install
```
Or manually run the built-in secret auditor:
```powershell
python scripts/check_secrets.py
```
