"""Simple CLI wrapper for pyATR.

Usage:
    python -m pyatr scan events.json [--rules-dir DIR]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from pyatr.engine import ATREngine
from pyatr.types import AgentEvent


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pyatr",
        description="pyATR -- Python reference engine for Agent Threat Rules",
    )
    sub = parser.add_subparsers(dest="command")

    scan_parser = sub.add_parser("scan", help="Scan events against ATR rules")
    scan_parser.add_argument("events_file", help="Path to a JSON file with events")
    scan_parser.add_argument(
        "--rules-dir",
        default=None,
        help="Directory containing ATR YAML rules (default: ../rules/)",
    )
    return parser


def _default_rules_dir() -> Path:
    return Path(__file__).resolve().parent.parent.parent / "rules"


def _load_events(path: str) -> list[AgentEvent]:
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        data = [data]
    events: list[AgentEvent] = []
    for item in data:
        events.append(
            AgentEvent(
                content=str(item.get("content", "")),
                event_type=str(item.get("event_type", item.get("type", "llm_input"))),
                fields=item.get("fields", {}),
                metadata=item.get("metadata", {}),
            )
        )
    return events


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command != "scan":
        parser.print_help()
        return 1

    rules_dir = Path(args.rules_dir) if args.rules_dir else _default_rules_dir()
    if not rules_dir.is_dir():
        print(f"Error: rules directory not found: {rules_dir}", file=sys.stderr)
        return 1

    engine = ATREngine()
    count = engine.load_rules_from_directory(rules_dir)
    print(f"Loaded {count} ATR rules from {rules_dir}")

    events = _load_events(args.events_file)
    print(f"Scanning {len(events)} event(s)...\n")

    total_matches = 0
    for i, event in enumerate(events):
        matches = engine.evaluate(event)
        if matches:
            total_matches += len(matches)
            snippet = (event.content[:80] + "...") if len(event.content) > 80 else event.content
            print(f"Event {i + 1}: {snippet!r}")
            for m in matches:
                print(f"  [{m.severity.upper()}] {m.rule_id} - {m.title}")
                print(f"    confidence={m.confidence}, patterns_matched={len(m.matched_patterns)}")
            print()

    if total_matches == 0:
        print("No threats detected.")
    else:
        print(f"Total: {total_matches} match(es) across {len(events)} event(s).")

    return 0 if total_matches == 0 else 2
