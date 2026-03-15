"""pyATR - Python reference engine for Agent Threat Rules (ATR)."""

from pathlib import Path

from pyatr.types import AgentEvent, ATRMatch, ATRRule
from pyatr.engine import ATREngine
from pyatr.validator import validate, ValidationResult, ValidationError
from pyatr.test_runner import run_tests, TestRunResult, RuleTestResult, TestCaseResult

__version__ = "0.2.0"
__all__ = [
    "ATREngine",
    "AgentEvent",
    "ATRMatch",
    "ATRRule",
    "ValidationError",
    "ValidationResult",
    "RuleTestResult",
    "TestCaseResult",
    "TestRunResult",
    "scan",
    "validate",
    "run_tests",
]

# Default rules directory: bundled rules from the npm package or sibling dir
_DEFAULT_RULES_DIR = Path(__file__).resolve().parent.parent.parent / "rules"


def scan(text: str, *, rules_dir: str | Path | None = None) -> list[ATRMatch]:
    """Convenience function: evaluate text against all ATR rules.

    Loads rules on first call (cached). Returns list of ATRMatch sorted by severity.
    """
    if not hasattr(scan, "_engine"):
        engine = ATREngine()
        rdir = Path(rules_dir) if rules_dir else _DEFAULT_RULES_DIR
        engine.load_rules_from_directory(rdir)
        scan._engine = engine  # type: ignore[attr-defined]
    return scan._engine.evaluate(AgentEvent(content=text, event_type="llm_input", fields={"user_input": text}))  # type: ignore[attr-defined]
