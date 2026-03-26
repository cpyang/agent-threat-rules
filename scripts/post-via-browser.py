"""
Post to X (Twitter) via browser-use — no API cost, uses your logged-in browser.

Usage:
    # Post a single message
    python3 scripts/post-via-browser.py --text "Your post here"

    # Post from a draft file
    python3 scripts/post-via-browser.py --file posts/2026-03-25/skillssec-001-short.md

    # Post to a specific account (switch browser profile)
    python3 scripts/post-via-browser.py --text "Post" --account skillssec

    # Dry run (just opens compose, doesn't click post)
    python3 scripts/post-via-browser.py --text "Post" --dry-run

Requires:
    pip3 install browser-use langchain-anthropic
    export ANTHROPIC_API_KEY=sk-ant-...
"""

import asyncio
import argparse
import os
import sys


async def post_to_x(text: str, dry_run: bool = False):
    try:
        from browser_use import Agent
        from langchain_anthropic import ChatAnthropic
    except ImportError:
        print("Install: pip3 install browser-use langchain-anthropic")
        sys.exit(1)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Set ANTHROPIC_API_KEY first")
        sys.exit(1)

    llm = ChatAnthropic(
        model_name="claude-sonnet-4-20250514",
        timeout=120,
        stop=None,
    )

    # Escape the text for the prompt
    escaped_text = text.replace('"', '\\"').replace('\n', '\\n')

    if dry_run:
        task = f"""
        Go to https://x.com/compose/post

        In the tweet compose box, type exactly this text (preserve line breaks):

        {text}

        DO NOT click the Post button. Just leave it ready for review.
        Tell me when the text is entered.
        """
    else:
        task = f"""
        Go to https://x.com/compose/post

        In the tweet compose box, type exactly this text (preserve line breaks):

        {text}

        Then click the "Post" button to publish the tweet.

        After posting, confirm success by reading the URL or any confirmation message.
        Report the URL of the posted tweet if visible.
        """

    agent = Agent(
        task=task,
        llm=llm,
        use_vision=True,
    )

    print(f"\n  Posting to X {'(DRY RUN)' if dry_run else ''}...")
    print(f"  Text: {text[:100]}{'...' if len(text) > 100 else ''}")
    print()

    result = await agent.run()
    print(f"\n  Result: {result}")
    return result


async def post_to_threads(text: str, dry_run: bool = False):
    from browser_use import Agent
    from langchain_anthropic import ChatAnthropic

    llm = ChatAnthropic(
        model_name="claude-sonnet-4-20250514",
        timeout=120,
        stop=None,
    )

    if dry_run:
        task = f"""
        Go to https://www.threads.net

        Find and click the compose/new post button (usually a "+" or pencil icon).

        In the compose box, type exactly this text:

        {text}

        DO NOT click Post. Just leave it ready for review.
        """
    else:
        task = f"""
        Go to https://www.threads.net

        Find and click the compose/new post button.

        In the compose box, type exactly this text:

        {text}

        Click the "Post" button to publish.
        Confirm success.
        """

    agent = Agent(task=task, llm=llm, use_vision=True)
    print(f"\n  Posting to Threads {'(DRY RUN)' if dry_run else ''}...")
    result = await agent.run()
    print(f"\n  Result: {result}")
    return result


async def post_to_reddit(text: str, subreddit: str = "netsec", dry_run: bool = False):
    from browser_use import Agent
    from langchain_anthropic import ChatAnthropic

    llm = ChatAnthropic(
        model_name="claude-sonnet-4-20250514",
        timeout=120,
        stop=None,
    )

    # Extract title (first line) and body
    lines = text.strip().split('\n')
    title = lines[0].replace('#', '').strip()[:300]
    body = '\n'.join(lines[1:]).strip()

    action = "DO NOT click Post." if dry_run else "Click the Post/Submit button."

    task = f"""
    Go to https://www.reddit.com/r/{subreddit}/submit?type=TEXT

    Fill in:
    - Title: {title}
    - Body/Text: {body}

    {action}
    """

    agent = Agent(task=task, llm=llm, use_vision=True)
    print(f"\n  Posting to r/{subreddit} {'(DRY RUN)' if dry_run else ''}...")
    result = await agent.run()
    print(f"\n  Result: {result}")
    return result


def main():
    parser = argparse.ArgumentParser(description="Post to social media via browser")
    parser.add_argument("--text", help="Text to post")
    parser.add_argument("--file", help="Read post from file")
    parser.add_argument("--platform", default="x", choices=["x", "threads", "reddit", "all"],
                        help="Platform to post to")
    parser.add_argument("--subreddit", default="netsec", help="Reddit subreddit (default: netsec)")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually post")
    parser.add_argument("--account", help="Account hint (skillssec or panguard)")

    args = parser.parse_args()

    if args.file:
        if not os.path.exists(args.file):
            print(f"File not found: {args.file}")
            sys.exit(1)
        text = open(args.file).read().strip()
    elif args.text:
        text = args.text
    else:
        print("Provide --text or --file")
        sys.exit(1)

    if args.platform == "x" or args.platform == "all":
        asyncio.run(post_to_x(text, args.dry_run))

    if args.platform == "threads" or args.platform == "all":
        asyncio.run(post_to_threads(text, args.dry_run))

    if args.platform == "reddit" or args.platform == "all":
        asyncio.run(post_to_reddit(text, args.subreddit, args.dry_run))


if __name__ == "__main__":
    main()
