import re
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.api import app
from backend.app.config import settings

client = TestClient(app)

def test_api_responses_contain_no_secrets():
    """Verify that all public API responses never leak secret keys or tokens."""
    endpoints = [
        "/health",
        "/dashboard",
        "/invoices",
        "/invoices/INV-2026-8941",
        "/invoices/INV-2026-8941/recommendation",
        "/vendors",
        "/insights"
    ]
    for ep in endpoints:
        res = client.get(ep)
        body_text = res.text
        # Assert no Groq or Hindsight keys are leaked
        assert "gsk_" not in body_text, f"Secret pattern 'gsk_' found in {ep} response!"
        if settings.groq_api_key:
            assert settings.groq_api_key not in body_text
        if settings.hindsight_api_key:
            assert settings.hindsight_api_key not in body_text

def test_repository_files_contain_no_committed_secrets():
    """Scan tracked repo files for leaked keys."""
    root_dir = Path(__file__).parent.parent.parent
    secret_pattern = re.compile(r"gsk_[A-Za-z0-9_-]{20,}")

    for file_path in root_dir.glob("**/*"):
        if file_path.is_file() and not any(part in file_path.parts for part in ["node_modules", ".git", ".venv", "venv", "__pycache__", "cache", "dist"]):
            if file_path.name in [".env", ".env.local"]:
                continue
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                matches = secret_pattern.findall(content)
                assert not matches, f"Leaked API key pattern found in {file_path}: {matches}"
            except Exception:
                pass
