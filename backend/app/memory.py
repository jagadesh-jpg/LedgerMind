from typing import Protocol
from backend.app.models import DecisionRecord, MemoryHit, VendorProfile
from backend.app.config import settings
import logging
import sqlite3
import json
from pathlib import Path

logger = logging.getLogger("ledgermind.memory")

class MemoryStore(Protocol):
    def retain(self, company_id: str, record: DecisionRecord) -> str: ...
    def recall(self, company_id: str, vendor_id: str, exception_type: str, query: str, limit: int = 5) -> list[MemoryHit]: ...
    def reflect(self, company_id: str, vendor_id: str) -> VendorProfile: ...
    def backend_name(self) -> str: ...

class LocalMemory:
    """Deterministic SQLite-based local memory store and fallback."""
    def __init__(self, db_path: str = "./ledgermind.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS local_memory (
                decision_id TEXT PRIMARY KEY,
                company_id TEXT,
                invoice_id TEXT,
                vendor_id TEXT,
                vendor_name TEXT,
                exception_type TEXT,
                decision TEXT,
                rationale TEXT,
                reviewer TEXT,
                source_reference TEXT,
                timestamp TEXT,
                variance_amount REAL,
                variance_pct REAL
            )
        """)
        conn.commit()
        conn.close()

    def backend_name(self) -> str:
        return "local"

    def retain(self, company_id: str, record: DecisionRecord) -> str:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO local_memory (
                decision_id, company_id, invoice_id, vendor_id, vendor_name,
                exception_type, decision, rationale, reviewer, source_reference,
                timestamp, variance_amount, variance_pct
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record.decision_id, company_id, record.invoice_id, record.vendor_id,
            record.vendor_name, record.exception_type, record.decision, record.rationale,
            record.reviewer, record.source_reference, record.timestamp,
            record.variance_amount, record.variance_pct
        ))
        conn.commit()
        conn.close()
        return record.decision_id

    def recall(self, company_id: str, vendor_id: str, exception_type: str, query: str, limit: int = 5) -> list[MemoryHit]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        # Query memories matching company and vendor
        cur.execute("""
            SELECT decision_id, vendor_id, exception_type, decision, rationale,
                   reviewer, source_reference, timestamp, variance_pct
            FROM local_memory
            WHERE company_id = ? AND vendor_id = ?
            ORDER BY timestamp DESC
        """, (company_id, vendor_id))
        rows = cur.fetchall()
        conn.close()

        hits: list[MemoryHit] = []
        for r in rows:
            # Score bonus if exact exception type match
            match_score = 1.0 if r[2] == exception_type else 0.6
            text = (
                f"On {r[7]}, for {vendor_id} under {r[2]} (variance: {r[8]:.1f}%), "
                f"decision was '{r[3]}'. Rationale: \"{r[4]}\". Reviewed by {r[5]} ({r[6]})."
            )
            hits.append(MemoryHit(
                decision_id=r[0],
                text=text,
                date=r[7],
                vendor_id=r[1],
                exception_type=r[2],
                decision=r[3],
                score=match_score
            ))

        # Sort by match score and return top limit
        hits.sort(key=lambda x: x.score, reverse=True)
        return hits[:limit]

    def reflect(self, company_id: str, vendor_id: str) -> VendorProfile:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            SELECT decision, COUNT(*)
            FROM local_memory
            WHERE company_id = ? AND vendor_id = ?
            GROUP BY decision
        """, (company_id, vendor_id))
        rows = cur.fetchall()
        conn.close()

        counts = {r[0]: r[1] for r in rows}
        total = sum(counts.values())

        summary_parts = [f"{action}: {cnt}" for action, cnt in counts.items()]
        summary = (
            f"Vendor {vendor_id} profile across {total} past exception decisions: "
            + (", ".join(summary_parts) if summary_parts else "No prior recorded decisions.")
        )
        return VendorProfile(
            vendor_id=vendor_id,
            summary=summary,
            total_decisions=total,
            action_counts=counts
        )

class HindsightMemory:
    """Official Hindsight Vectorize client memory store."""
    def __init__(self, base_url: str, api_key: str | None = None, fallback_store: MemoryStore | None = None):
        self.base_url = base_url
        self.api_key = api_key
        self.fallback = fallback_store or LocalMemory()
        self._client = None
        if api_key:
            try:
                from hindsight_client import Hindsight
                self._client = Hindsight(base_url=self.base_url, api_key=self.api_key, timeout=30.0)
            except Exception as e:
                logger.warning(f"Could not initialize Hindsight client: {e}. Falling back to local.")

    def backend_name(self) -> str:
        return "hindsight" if self._client is not None else "local"

    def retain(self, company_id: str, record: DecisionRecord) -> str:
        # Always retain into fallback as well for offline evaluation & backup
        self.fallback.retain(company_id, record)

        if not self._client:
            return record.decision_id

        bank_id = f"{company_id}-ap"
        content = (
            f"Date: {record.timestamp}. Vendor: {record.vendor_name} ({record.vendor_id}). "
            f"Exception: {record.exception_type} with variance of ₹{record.variance_amount:,.2f} ({record.variance_pct:.1f}%). "
            f"Human Decision: {record.decision}. Rationale: \"{record.rationale}\". "
            f"Reviewer: {record.reviewer}. Reference: {record.source_reference}."
        )
        try:
            self._client.retain(
                bank_id=bank_id,
                content=content,
                context=f"vendor:{record.vendor_id}|exception:{record.exception_type}",
                document_id=record.decision_id,
                metadata={
                    "vendor_id": record.vendor_id,
                    "exception_type": record.exception_type,
                    "decision": record.decision
                }
            )
        except Exception as e:
            logger.warning(f"Hindsight retain failed: {e}. Record preserved in local fallback.")
        return record.decision_id

    def recall(self, company_id: str, vendor_id: str, exception_type: str, query: str, limit: int = 5) -> list[MemoryHit]:
        if not self._client:
            return self.fallback.recall(company_id, vendor_id, exception_type, query, limit)

        bank_id = f"{company_id}-ap"
        try:
            res = self._client.recall(bank_id=bank_id, query=f"{vendor_id} {exception_type} {query}")
            hits: list[MemoryHit] = []
            if hasattr(res, "results") and res.results:
                for idx, r in enumerate(res.results[:limit]):
                    text = getattr(r, "text", str(r))
                    hits.append(MemoryHit(
                        decision_id=f"HINDSIGHT-{idx+1}",
                        text=text,
                        date="Recorded Precedent",
                        vendor_id=vendor_id,
                        exception_type=exception_type,
                        decision="APPROVED_OR_HELD",
                        score=0.95
                    ))
            if hits:
                return hits
        except Exception as e:
            logger.warning(f"Hindsight recall error: {e}. Using local memory fallback.")

        return self.fallback.recall(company_id, vendor_id, exception_type, query, limit)

    def reflect(self, company_id: str, vendor_id: str) -> VendorProfile:
        if not self._client:
            return self.fallback.reflect(company_id, vendor_id)

        bank_id = f"{company_id}-ap"
        try:
            res = self._client.reflect(bank_id=bank_id, query=f"What patterns have we learned about {vendor_id}'s invoice exceptions and how should they be handled?")
            summary_text = getattr(res, "text", str(res))
            base_profile = self.fallback.reflect(company_id, vendor_id)
            return VendorProfile(
                vendor_id=vendor_id,
                summary=summary_text or base_profile.summary,
                total_decisions=base_profile.total_decisions,
                action_counts=base_profile.action_counts
            )
        except Exception as e:
            logger.warning(f"Hindsight reflect error: {e}. Using local reflect fallback.")
            return self.fallback.reflect(company_id, vendor_id)

def get_memory_store() -> MemoryStore:
    if settings.memory_backend.lower() == "hindsight" and settings.hindsight_api_key:
        return HindsightMemory(
            base_url=settings.hindsight_base_url,
            api_key=settings.hindsight_api_key,
            fallback_store=LocalMemory()
        )
    return LocalMemory()
