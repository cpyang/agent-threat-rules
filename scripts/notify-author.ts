#!/usr/bin/env npx tsx
/**
 * Responsible Disclosure — Notify Skill Authors
 *
 * Opens GitHub issues on flagged MCP skill repositories to notify
 * authors of security findings, 72 hours before public disclosure.
 *
 * Usage:
 *   npx tsx scripts/notify-author.ts --input data/scan-batch-20260325.json
 *   npx tsx scripts/notify-author.ts --input data/scan-batch-20260325.json --dry-run
 *
 * Requires: GITHUB_TOKEN with repo scope
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanResult {
  package: string;
  version: string;
  url: string;
  riskScore: number;
  riskLevel: string;
  atrMatches: Array<{ ruleId: string; severity: string; title: string }>;
  genuineThreats: string[];
  auditedAt: string;
}

interface NotificationRecord {
  package: string;
  issueUrl: string;
  notifiedAt: string;
  disclosureDate: string;
}

// ---------------------------------------------------------------------------
// Issue Template
// ---------------------------------------------------------------------------

function buildIssueTitle(result: ScanResult): string {
  return `[Security] ATR scan found ${result.riskLevel} risk patterns in this MCP skill`;
}

function buildIssueBody(result: ScanResult): string {
  const disclosureDate = new Date(Date.now() + 72 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

  const findings = result.atrMatches
    .map(m => `- **${m.ruleId}** (${m.severity}): ${m.title}`)
    .join('\n');

  const threats = result.genuineThreats
    .filter(t => !t.startsWith('[AST-L2]')) // don't leak AST internals
    .slice(0, 5)
    .map(t => `- ${t.split('(')[0]!.trim()}`) // remove file:line references
    .join('\n');

  return `## Security Findings

Hi, we ran an automated security scan on this MCP skill using [ATR (Agent Threat Rules)](https://github.com/panguard-ai/agent-threat-rules), an open standard for AI agent security.

**Package:** \`${result.package}\` v${result.version}
**Risk Score:** ${result.riskScore}/100
**Risk Level:** ${result.riskLevel}

### ATR Rules Triggered

${findings || 'Behavioral analysis (no specific rule match)'}

### Summary of Concerns

${threats || 'See ATR rules above for details.'}

### Why This Matters

MCP skills run with the same permissions as the AI agent — full filesystem access, shell execution, and network access. Security issues in MCP skills can lead to credential theft, data exfiltration, or unauthorized actions on users' machines.

### What We Recommend

1. Review the flagged patterns in your source code
2. If the findings are false positives, please let us know — we'll update our rules
3. If the findings are valid, consider fixing them and publishing a patched version

### Disclosure Timeline

- **Today:** This notification (private issue)
- **${disclosureDate}:** Public disclosure via ecosystem security report (72-hour window)

We follow responsible disclosure practices. If you need more time to address these findings, please respond to this issue and we'll extend the timeline.

### About ATR

ATR is an open-source detection standard for AI agent threats. Rules are MIT licensed and community-maintained. False positive reports help us improve detection accuracy.

- Rules: https://github.com/panguard-ai/agent-threat-rules
- Scan your skills: \`npx @panguard-ai/panguard audit\`

---

*This issue was created by an automated scanner. If this is a false positive, we apologize for the noise — please let us know so we can tune our rules.*`;
}

// ---------------------------------------------------------------------------
// GitHub API
// ---------------------------------------------------------------------------

async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  token: string,
  dryRun: boolean,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (dryRun) {
    console.log(`    [DRY-RUN] Would create issue on ${owner}/${repo}`);
    return { ok: true, url: `https://github.com/${owner}/${repo}/issues/dry-run` };
  }

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['security'],
      }),
    });

    if (resp.ok) {
      const data = await resp.json() as { html_url: string };
      return { ok: true, url: data.html_url };
    }

    const err = await resp.text();

    // Issues might be disabled on this repo
    if (resp.status === 410 || resp.status === 404) {
      return { ok: false, error: 'Issues disabled or repo not found' };
    }

    return { ok: false, error: `${resp.status}: ${err.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function extractGitHubRepo(url: string): { owner: string; repo: string } | null {
  // Handle github.com URLs
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return { owner: match[1]!, repo: match[2]!.replace(/\.git$/, '') };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const inputIdx = process.argv.indexOf('--input');
  const inputPath = inputIdx >= 0
    ? resolve(process.argv[inputIdx + 1]!)
    : resolve('data/scan-batch-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.json');

  const dryRun = process.argv.includes('--dry-run');
  const token = process.env['GITHUB_TOKEN'] ?? '';

  if (!token && !dryRun) {
    console.error('GITHUB_TOKEN required. Set it or use --dry-run.');
    process.exit(1);
  }

  if (!existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  // Load notification history to avoid duplicate issues
  const historyPath = resolve('data/notification-history.json');
  const history: NotificationRecord[] = existsSync(historyPath)
    ? JSON.parse(readFileSync(historyPath, 'utf-8'))
    : [];
  const notifiedPackages = new Set(history.map(r => r.package));

  const data = JSON.parse(readFileSync(inputPath, 'utf-8'));
  const results: ScanResult[] = data.results ?? [];

  // Only notify for CRITICAL and HIGH with GitHub URLs
  const flagged = results.filter(r =>
    (r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH') &&
    r.url &&
    !notifiedPackages.has(r.package)
  );

  console.log(`\n  Responsible Disclosure — Author Notification`);
  console.log(`  Input: ${inputPath}`);
  console.log(`  Flagged: ${flagged.length} (CRITICAL+HIGH, not yet notified)`);
  console.log(`  Previously notified: ${notifiedPackages.size}`);
  console.log(`  Dry run: ${dryRun}\n`);

  let notified = 0;
  let skipped = 0;
  let failed = 0;

  for (const result of flagged) {
    const repo = extractGitHubRepo(result.url);
    if (!repo) {
      console.log(`  [SKIP] ${result.package} — no GitHub URL (${result.url})`);
      skipped++;
      continue;
    }

    const title = buildIssueTitle(result);
    const body = buildIssueBody(result);

    console.log(`  [NOTIFY] ${result.package} → ${repo.owner}/${repo.repo}`);
    const response = await createIssue(repo.owner, repo.repo, title, body, token, dryRun);

    if (response.ok) {
      notified++;
      console.log(`    Issue: ${response.url}`);

      const disclosureDate = new Date(Date.now() + 72 * 60 * 60 * 1000)
        .toISOString().slice(0, 10);

      history.push({
        package: result.package,
        issueUrl: response.url ?? '',
        notifiedAt: new Date().toISOString(),
        disclosureDate,
      });
    } else {
      failed++;
      console.log(`    Failed: ${response.error}`);
    }

    // Rate limit: 1 issue per 3 seconds
    await new Promise(r => setTimeout(r, 3000));
  }

  // Save history
  writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');

  console.log('\n  ==============================');
  console.log('  NOTIFICATION SUMMARY');
  console.log('  ==============================');
  console.log(`  Notified: ${notified}`);
  console.log(`  Skipped:  ${skipped} (no GitHub URL)`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  History:  ${historyPath}`);
  console.log('');

  if (notified > 0) {
    const disclosureDate = new Date(Date.now() + 72 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    console.log(`  72-hour disclosure window ends: ${disclosureDate}`);
    console.log('  After that date, run generate-skillssec-posts.ts to create public posts.');
    console.log('');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
