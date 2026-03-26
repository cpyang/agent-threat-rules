# Weekly War Report

Generate the PanGuard weekly ecosystem report from cumulative scan data.

## Steps

1. Load cumulative data:
```bash
cd /Users/user/Downloads/agent-threat-rules
node -e "
const d = require('./data/scan-cumulative.json');
const r = d.results || [];
const c = r.filter(x => x.riskLevel==='CRITICAL');
const h = r.filter(x => x.riskLevel==='HIGH');
console.log('Total:', r.length);
console.log('CRITICAL:', c.length);
console.log('HIGH:', h.length);
console.log('CLEAN:', r.filter(x => x.riskLevel==='CLEAN'||x.riskLevel==='LOW').length);
console.log('---');
console.log('Top threats this week:');
[...c,...h].sort((a,b)=>b.riskScore-a.riskScore).slice(0,10).forEach(x =>
  console.log('  ['+x.riskLevel+'] '+x.package+' (score:'+x.riskScore+') — '+(x.genuineThreats?.[0]||'').slice(0,80))
);
"
```

2. Generate weekly report using T4 (Weekly War Report) template

3. Generate posts directory:
```bash
cd /Users/user/Downloads/agent-threat-rules && npx tsx scripts/generate-skillssec-posts.ts --input data/scan-cumulative.json --weekly
```

4. Show the generated weekly post for review

5. Ask: Approve for publishing?

6. Export updated CSV for public data:
```bash
cd /Users/user/Downloads/agent-threat-rules && npx tsx scripts/export-public-report.ts
```
