"""
Security Event Monitor — watches X, HN, Reddit for AI/MCP security incidents,
then generates PanGuard-angled response posts.

Uses browser-use to scrape real-time security feeds.

Usage:
    # Check for new security events
    python3 scripts/monitor-security-events.py

    # Check and auto-generate response posts
    python3 scripts/monitor-security-events.py --generate

    # Check specific source only
    python3 scripts/monitor-security-events.py --source x
    python3 scripts/monitor-security-events.py --source hn
    python3 scripts/monitor-security-events.py --source reddit

Requires: browser-use, langchain-anthropic
"""

import asyncio
import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path


EVENTS_DB = Path(__file__).parent.parent / "data" / "security-events.json"
POSTS_DIR = Path(__file__).parent.parent / "posts"


def load_events_db() -> list:
    if EVENTS_DB.exists():
        return json.loads(EVENTS_DB.read_text())
    return []


def save_events_db(events: list):
    EVENTS_DB.parent.mkdir(parents=True, exist_ok=True)
    EVENTS_DB.write_text(json.dumps(events, indent=2, ensure_ascii=False))


async def scan_x_for_events() -> list:
    try:
        from browser_use import Agent
        from langchain_anthropic import ChatAnthropic
    except ImportError:
        print("Install: pip3 install browser-use langchain-anthropic")
        return []

    llm = ChatAnthropic(model_name="claude-sonnet-4-20250514", timeout=180, stop=None)

    task = """
    Go to https://x.com/search?q=(MCP%20OR%20%22supply%20chain%20attack%22%20OR%20%22npm%20malicious%22%20OR%20%22pypi%20malicious%22%20OR%20%22AI%20agent%20security%22%20OR%20%22MCP%20server%20vulnerability%22)%20min_faves%3A50&src=typed_query&f=live

    Look at the top 10 most recent posts.
    For each post that is about a REAL security incident (not just general discussion):

    Extract:
    - author: the @username
    - text: the full post text (first 500 chars)
    - engagement: approximate likes/retweets
    - url: the post URL if visible
    - relevance: rate 1-10 how relevant this is to MCP/AI agent/supply chain security

    Return as JSON array. Only include posts with relevance >= 6.
    If no relevant posts found, return empty array [].
    """

    agent = Agent(task=task, llm=llm, use_vision=True)
    result = await agent.run()

    # Try to parse JSON from result
    try:
        # Find JSON in the result
        text = str(result)
        start = text.find('[')
        end = text.rfind(']') + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        pass

    return []


async def scan_hn_for_events() -> list:
    try:
        from browser_use import Agent
        from langchain_anthropic import ChatAnthropic
    except ImportError:
        return []

    llm = ChatAnthropic(model_name="claude-sonnet-4-20250514", timeout=180, stop=None)

    task = """
    Go to https://hn.algolia.com/?dateRange=last24h&page=0&prefix=false&query=MCP%20OR%20%22supply%20chain%20attack%22%20OR%20%22npm%20malicious%22%20OR%20%22AI%20security%22&sort=byPopularity&type=story

    Look at the search results. For each story about a REAL security incident:

    Extract:
    - title: the story title
    - points: the point count
    - url: the HN discussion URL
    - relevance: rate 1-10 how relevant to MCP/AI agent/supply chain security

    Return as JSON array. Only include items with relevance >= 6.
    If nothing relevant, return [].
    """

    agent = Agent(task=task, llm=llm, use_vision=True)
    result = await agent.run()

    try:
        text = str(result)
        start = text.find('[')
        end = text.rfind(']') + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        pass

    return []


async def generate_response_post(event: dict) -> str:
    """Use Claude to generate a SkillsSec response post for a security event."""
    try:
        from langchain_anthropic import ChatAnthropic
    except ImportError:
        return ""

    llm = ChatAnthropic(model_name="claude-sonnet-4-20250514", timeout=60, stop=None)

    prompt = f"""You are writing a post for the @SkillsSec X account about a security incident.

The incident:
{json.dumps(event, indent=2, ensure_ascii=False)}

Rules:
1. Tone: sardonic expert, not corporate. Think security researcher, not marketing.
2. Connect this to MCP/AI agent security — how does this affect people using Claude Code, Cursor, or other AI agents?
3. End with: npx @panguard-ai/panguard audit
4. NEVER mention PanGuard by name
5. Keep under 280 characters for X, or write a thread (multiple tweets separated by ---)
6. Include relevant hashtags
7. Be factual — don't exaggerate, the real facts are scary enough

Write the post now. Output ONLY the post text, nothing else."""

    response = await llm.ainvoke(prompt)
    return response.content


async def main_monitor(sources: list[str], generate: bool):
    print(f"\n  Security Event Monitor")
    print(f"  Sources: {', '.join(sources)}")
    print(f"  Generate posts: {generate}")
    print(f"  Time: {datetime.now().isoformat()}\n")

    existing = load_events_db()
    existing_texts = {e.get("text", "")[:100] for e in existing}
    new_events = []

    if "x" in sources:
        print("  Scanning X...")
        x_events = await scan_x_for_events()
        for e in x_events:
            e["source"] = "x"
            e["scannedAt"] = datetime.now().isoformat()
        new_events.extend(x_events)
        print(f"    Found: {len(x_events)} relevant posts")

    if "hn" in sources:
        print("  Scanning Hacker News...")
        hn_events = await scan_hn_for_events()
        for e in hn_events:
            e["source"] = "hn"
            e["scannedAt"] = datetime.now().isoformat()
        new_events.extend(hn_events)
        print(f"    Found: {len(hn_events)} relevant stories")

    # Dedup
    truly_new = [e for e in new_events if e.get("text", e.get("title", ""))[:100] not in existing_texts]
    print(f"\n  New events (after dedup): {len(truly_new)}")

    if truly_new:
        # Save to events DB
        existing.extend(truly_new)
        save_events_db(existing)

        for event in truly_new:
            title = event.get("title", event.get("text", ""))[:80]
            source = event.get("source", "?")
            relevance = event.get("relevance", "?")
            print(f"\n  [{source}] (relevance: {relevance}) {title}")

            if generate:
                print("    Generating response post...")
                post = await generate_response_post(event)
                if post:
                    # Save post
                    date_str = datetime.now().strftime("%Y-%m-%d")
                    post_dir = POSTS_DIR / date_str
                    post_dir.mkdir(parents=True, exist_ok=True)

                    slug = title[:40].lower().replace(" ", "-").replace("/", "-")
                    slug = "".join(c for c in slug if c.isalnum() or c == "-")
                    post_file = post_dir / f"event-response-{slug}.md"
                    post_file.write_text(post)
                    print(f"    Saved: {post_file}")
                    print(f"    Preview: {post[:200]}...")
    else:
        print("  No new events found.")

    print()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", choices=["x", "hn", "reddit", "all"], default="all")
    parser.add_argument("--generate", action="store_true", help="Auto-generate response posts")
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Set ANTHROPIC_API_KEY first")
        sys.exit(1)

    sources = ["x", "hn"] if args.source == "all" else [args.source]
    asyncio.run(main_monitor(sources, args.generate))


if __name__ == "__main__":
    main()
