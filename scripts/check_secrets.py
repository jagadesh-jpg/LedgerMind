#!/usr/bin/env python
import re
import sys
from pathlib import Path

def scan_for_secrets():
    root = Path(__file__).parent.parent
    patterns = [
        re.compile(r"gsk_[A-Za-z0-9_-]{20,}"),
        re.compile(r"(?i)api[_-]?key\s*=\s*['\"][A-Za-z0-9_-]{16,}['\"]"),
        re.compile(r"(?i)secret[_-]?key\s*=\s*['\"][A-Za-z0-9_-]{16,}['\"]")
    ]

    ignored_dirs = {"node_modules", ".git", ".venv", "venv", "__pycache__", ".agent_cache", "dist"}
    ignored_files = {".env", ".env.local"}

    violations = []
    for p in root.glob("**/*"):
        if p.is_file() and not any(part in p.parts for part in ignored_dirs):
            if p.name in ignored_files or p.name.endswith(".example"):
                continue
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                for pat in patterns:
                    if pat.search(content):
                        violations.append(f"{p}: Pattern {pat.pattern} matched.")
            except Exception:
                pass

    if violations:
        print("[ERROR] Potential secrets detected in repository files:")
        for v in violations:
            print(f"  - {v}")
        print("\nPlease remove all API keys and store them only in backend/.env (which is git-ignored).")
        sys.exit(1)

    print("[OK] Secret scan passed. No exposed secrets found.")
    sys.exit(0)

if __name__ == "__main__":
    scan_for_secrets()
