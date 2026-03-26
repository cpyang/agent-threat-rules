"""
Set up X (Twitter) Developer App User Authentication via browser-use.

Opens your real browser, navigates to the skillssec app settings,
and configures User Authentication for Read+Write access.

Usage:
    python3 scripts/setup-x-auth.py

Requires: browser-use, ANTHROPIC_API_KEY
"""

import asyncio
import os
import sys

async def main():
    try:
        from browser_use import Agent
        from langchain_anthropic import ChatAnthropic
    except ImportError:
        print("Missing dependencies. Install with:")
        print("  pip3 install browser-use langchain-anthropic")
        sys.exit(1)

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Set ANTHROPIC_API_KEY first:")
        print("  export ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    llm = ChatAnthropic(
        model_name="claude-sonnet-4-20250514",
        timeout=120,
        stop=None,
    )

    task = """
    Go to https://console.x.com/en/portal/projects-and-apps

    Find the app named "skillssec" and click on it.

    Then find and click on "User authentication settings" section, click "Set up" or "Edit".

    Configure the following:
    1. App permissions: Select "Read and write"
    2. Type of App: Select "Web App, Automated App or Bot"
    3. Callback URI / Redirect URL: Enter "https://panguard.ai/callback"
    4. Website URL: Enter "https://panguard.ai"

    Save the settings.

    After saving, go to the "Keys and tokens" tab.
    Find "Access Token and Secret" section.
    Click "Generate" to generate a new Access Token.

    IMPORTANT: When the Access Token and Secret are shown, read them carefully
    and report them back to me. They will only be shown once.
    """

    agent = Agent(
        task=task,
        llm=llm,
        use_vision=True,
    )

    result = await agent.run()
    print("\n=== Result ===")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
