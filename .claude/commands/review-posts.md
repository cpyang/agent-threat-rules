# Review Generated Posts

Show today's generated Skills Sec posts for review and approval.

## Steps

1. Find today's posts directory:
```bash
ls -la /Users/user/Downloads/agent-threat-rules/posts/$(date +%Y-%m-%d)/ 2>/dev/null || ls -la /Users/user/Downloads/agent-threat-rules/posts/ | tail -5
```

2. Read the manifest.json to get post list

3. For each post, show:
   - Target platforms
   - Brand (skillssec or panguard)
   - Full content
   - Risk level of the skill

4. Ask for each post:
   - A) Approve — ready to publish
   - B) Edit — show me and I'll give feedback, then regenerate
   - C) Skip — don't publish this one
   - D) Approve all remaining

5. For approved posts, update manifest.json with `"approved": true`

6. Show summary: N approved, N skipped, N edited
