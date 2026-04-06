/**
 * ATR Mega Scan — World's largest MCP SKILL.md security scan
 * 53,000+ skills across OpenClaw + Skills.sh
 * Uses 93-rule engine with cross-context detection + base64 decode
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { ATREngine } from './dist/engine.js';
import { computeContentHash } from './dist/content-hash.js';

const RULES_DIR = resolve('rules');
const TC_URL = 'https://tc.panguard.ai';
const MAX_FILE_SIZE = 500_000; // 500KB

// Collect all SKILL.md files
function walkDir(dir, maxDepth = 5, depth = 0) {
  const files = [];
  if (depth > maxDepth) return files;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        files.push(...walkDir(full, maxDepth, depth + 1));
      } else if (entry.name === 'SKILL.md' || entry.name === 'skill.md' || entry.name.endsWith('.md')) {
        files.push(full);
      }
    }
  } catch { /* permission */ }
  return files;
}

async function pushThreatToTC(threat) {
  try {
    await fetch(TC_URL + '/api/skill-threats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillHash: threat.hash,
        skillName: threat.name,
        riskScore: Math.round(threat.score),
        riskLevel: threat.level,
        findingSummaries: threat.findings.map(f => ({
          id: f.ruleId,
          category: f.category,
          severity: f.severity,
          title: f.title,
        })),
      }),
    });
  } catch { /* continue on error */ }
}

async function main() {
  const engine = new ATREngine({ rulesDir: RULES_DIR });
  const ruleCount = await engine.loadRules();
  console.log(`Engine loaded: ${ruleCount} rules`);

  // Collect files
  console.log('Collecting files...');
  const openclawFiles = walkDir('/tmp/openclaw-skills/skills', 5)
    .filter(f => f.endsWith('SKILL.md') || f.endsWith('skill.md'));
  const skillsShFiles = walkDir(resolve('data/skills-sh/skills'), 5);
  
  console.log(`OpenClaw: ${openclawFiles.length} files`);
  console.log(`Skills.sh: ${skillsShFiles.length} files`);
  
  const allFiles = [...openclawFiles, ...skillsShFiles];
  console.log(`Total: ${allFiles.length} files to scan\n`);

  // Stats
  let scanned = 0, skipped = 0, clean = 0, flagged = 0;
  let tcPushed = 0;
  const ruleHits = {};
  const severityCount = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  const threats = [];
  const startTime = Date.now();

  for (const file of allFiles) {
    try {
      const stat = statSync(file);
      if (stat.size > MAX_FILE_SIZE || stat.size < 10) { skipped++; continue; }
      
      const content = readFileSync(file, 'utf-8');
      const matches = engine.scanSkill(content);
      scanned++;
      
      if (matches.length > 0) {
        flagged++;
        const topSeverity = matches.reduce((max, m) => {
          const order = { critical: 4, high: 3, medium: 2, low: 1, informational: 0 };
          return (order[m.rule.severity] || 0) > (order[max] || 0) ? m.rule.severity : max;
        }, 'informational');
        severityCount[topSeverity]++;
        
        for (const m of matches) {
          ruleHits[m.rule.id] = (ruleHits[m.rule.id] || 0) + 1;
        }
        
        // Only push CRITICAL and HIGH to TC
        if (topSeverity === 'critical' || topSeverity === 'high') {
          const threat = {
            hash: computeContentHash(content),
            name: file.split('/').slice(-2).join('/'),
            score: Math.max(...matches.map(m => m.confidence * 100)),
            level: topSeverity.toUpperCase(),
            findings: matches.map(m => ({
              ruleId: m.rule.id,
              category: m.rule.tags.category,
              severity: m.rule.severity,
              title: m.rule.title,
            })),
          };
          threats.push(threat);
        }
      } else {
        clean++;
      }
      
      // Progress every 5000
      if (scanned % 5000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (scanned / (Date.now() - startTime) * 1000).toFixed(0);
        process.stdout.write(`  ${scanned}/${allFiles.length} (${rate}/s, ${elapsed}s, flagged=${flagged})\r`);
      }
    } catch { skipped++; }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`ATR MEGA SCAN RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Time:     ${elapsed}s`);
  console.log(`Scanned:  ${scanned}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Clean:    ${clean} (${(clean/scanned*100).toFixed(2)}%)`);
  console.log(`Flagged:  ${flagged} (${(flagged/scanned*100).toFixed(2)}%)`);
  console.log(`\nSeverity breakdown:`);
  for (const [sev, count] of Object.entries(severityCount)) {
    if (count > 0) console.log(`  ${sev}: ${count}`);
  }
  
  console.log(`\nTop rules fired:`);
  const sorted = Object.entries(ruleHits).sort((a, b) => b[1] - a[1]);
  for (const [id, count] of sorted.slice(0, 15)) {
    console.log(`  ${id}: ${count} hits`);
  }
  
  // Push threats to TC in batches
  console.log(`\nPushing ${threats.length} CRITICAL+HIGH threats to TC...`);
  let pushOk = 0, pushFail = 0;
  for (let i = 0; i < threats.length; i++) {
    try {
      const resp = await fetch(TC_URL + '/api/skill-threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillHash: threats[i].hash,
          skillName: threats[i].name,
          riskScore: Math.round(threats[i].score),
          riskLevel: threats[i].level,
          findingSummaries: threats[i].findings.map(f => ({
            id: f.ruleId,
            category: f.category,
            severity: f.severity,
            title: f.title,
          })),
        }),
      });
      if (resp.ok) pushOk++;
      else pushFail++;
    } catch { pushFail++; }
    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i+1}/${threats.length} pushed\r`);
  }
  
  console.log(`\nTC push: ${pushOk} ok, ${pushFail} failed`);
  
  // Save report
  const report = {
    scan_date: new Date().toISOString(),
    engine_version: '1.1.0',
    rules_loaded: ruleCount,
    sources: {
      openclaw: openclawFiles.length,
      skills_sh: skillsShFiles.length,
    },
    totals: { scanned, skipped, clean, flagged },
    flagged_rate: (flagged / scanned * 100).toFixed(3) + '%',
    severity: severityCount,
    rule_hits: sorted.map(([id, count]) => ({ id, count })),
    tc_pushed: { ok: pushOk, fail: pushFail },
    threats_summary: threats.length,
  };
  writeFileSync('data/mega-scan-report.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved: data/mega-scan-report.json');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
