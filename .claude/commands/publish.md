# Publish Posts (via Browser)

Publish Skills Sec posts using browser-use — no API cost, uses logged-in browser sessions.

## Steps

1. Find latest posts:
```bash
cd /Users/user/Downloads/agent-threat-rules
LATEST=$(ls -d posts/*/ 2>/dev/null | sort | tail -1)
echo "Latest: $LATEST"
[ -d "$LATEST" ] && ls "$LATEST"/*.md 2>/dev/null
```

2. Read the manifest and show each post for approval.

3. For each approved post, ask which platform:
   - A) X (@SkillsSec)
   - B) Threads
   - C) Reddit
   - D) All platforms
   - E) Skip

4. Publish via browser-use (make sure the right account is logged in first):
```bash
cd /Users/user/Downloads/agent-threat-rules
export ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
python3 scripts/post-via-browser.py --file "$POST_FILE" --platform x
```

5. For multiple platforms, run sequentially:
```bash
python3 scripts/post-via-browser.py --file "$POST_FILE" --platform x
python3 scripts/post-via-browser.py --file "$POST_FILE" --platform threads
python3 scripts/post-via-browser.py --file "$POST_FILE" --platform reddit --subreddit netsec
```

6. Use --dry-run first to preview without posting:
```bash
python3 scripts/post-via-browser.py --file "$POST_FILE" --platform x --dry-run
```

## Important
- Make sure the correct X account is logged in before posting (SkillsSec vs PanGuard)
- browser-use opens a real browser window — you can see and stop it anytime
- No API credits needed, completely free
- Each post costs ~$0.01 in Anthropic API for browser-use agent
