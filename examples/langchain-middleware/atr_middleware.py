"""
ATR Middleware for LangChain
Scans user input against Agent Threat Rules before forwarding to the LLM.

Supports two backends:
  - Option A: pyatr (Python engine, preferred)
  - Option B: subprocess + npx agent-threat-rules (fallback)
"""

import json
import subprocess
import tempfile
from pathlib import Path
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


# Confidence string → float mapping (ATR uses string confidence in rules)
_CONFIDENCE_MAP = {"high": 0.9, "medium": 0.7, "low": 0.5}


def _scan_with_pyatr(text: str) -> list[dict]:
    """Option A: scan using the pyatr Python package."""
    import pyatr

    matches = pyatr.scan(text)
    return [
        {
            "rule_id": m.rule_id,
            "confidence": _CONFIDENCE_MAP.get(m.confidence, 0.5),
            "description": m.description,
            "severity": m.severity,
        }
        for m in matches
    ]


def _scan_with_npx(text: str) -> list[dict]:
    """Option B: scan using npx agent-threat-rules CLI (writes temp file)."""
    # The CLI expects a JSON file, not inline text
    event = {
        "type": "llm_input",
        "timestamp": "2026-01-01T00:00:00Z",
        "content": text,
        "fields": {"user_input": text},
    }
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False
    ) as tmp:
        json.dump([event], tmp)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            ["npx", "agent-threat-rules", "scan", tmp_path, "--json"],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if result.returncode != 0:
            return []  # Fail open — don't block on scan errors
        data = json.loads(result.stdout)
        return [
            {
                "rule_id": m.get("ruleId", "unknown"),
                "confidence": float(m.get("confidence", 0)),
                "description": m.get("title", ""),
                "severity": m.get("severity", "medium"),
            }
            for m in (data if isinstance(data, list) else [])
        ]
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError):
        return []  # Fail open
    finally:
        Path(tmp_path).unlink(missing_ok=True)


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
            conf = f.get("confidence", 0)
            if isinstance(conf, str):
                conf = _CONFIDENCE_MAP.get(conf, 0.5)
            if conf >= threshold:
                if safe_message is not None:
                    return safe_message
                raise ThreatDetectedError(
                    rule_id=f.get("rule_id", "unknown"),
                    confidence=conf,
                    description=f.get("description", ""),
                )
        return input_text

    return RunnableLambda(_guard)
