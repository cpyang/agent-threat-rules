"""
ATR Middleware for LangChain
Scans user input against Agent Threat Rules before forwarding to the LLM.

Supports two backends:
  - Option A: pyatr (Python engine, preferred)
  - Option B: subprocess + npx agent-threat-rules (fallback)
"""

import json
import subprocess
from typing import Any

from langchain_core.runnables import RunnableConfig, RunnableLambda


class ThreatDetectedError(Exception):
    """Raised when ATR detects a threat above the confidence threshold."""

    def __init__(self, rule_id: str, confidence: float, description: str):
        self.rule_id = rule_id
        self.confidence = confidence
        self.description = description
        super().__init__(
            f"Threat detected [{rule_id}] (confidence={confidence:.2f}): {description}"
        )


def _scan_with_pyatr(text: str) -> list[dict]:
    """Option A: scan using the pyatr Python package."""
    import pyatr

    results = pyatr.scan(text)
    return [
        {"rule_id": r.rule_id, "confidence": r.confidence, "description": r.description}
        for r in results
    ]


def _scan_with_npx(text: str) -> list[dict]:
    """Option B: scan using npx agent-threat-rules CLI."""
    result = subprocess.run(
        ["npx", "agent-threat-rules", "scan", "--input", text, "--format", "json"],
        capture_output=True,
        text=True,
        timeout=15,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ATR scan failed: {result.stderr.strip()}")
    return json.loads(result.stdout)


def _pick_scanner():
    """Return the best available scan function."""
    try:
        import pyatr  # noqa: F401

        return _scan_with_pyatr
    except ImportError:
        return _scan_with_npx


def atr_guard(threshold: float = 0.7, safe_message: str | None = None):
    """
    Return a LangChain Runnable that blocks threats.

    Args:
        threshold: Minimum confidence to treat as a threat (0.0-1.0).
        safe_message: If set, return this string instead of raising an error.

    Returns:
        A RunnableLambda that passes clean input through or blocks threats.
    """
    scan = _pick_scanner()

    def _guard(input_text: str, config: RunnableConfig | None = None) -> str:
        findings = scan(input_text)
        for f in findings:
            if f.get("confidence", 0) >= threshold:
                if safe_message is not None:
                    return safe_message
                raise ThreatDetectedError(
                    rule_id=f.get("rule_id", "unknown"),
                    confidence=f["confidence"],
                    description=f.get("description", ""),
                )
        return input_text

    return RunnableLambda(_guard)
