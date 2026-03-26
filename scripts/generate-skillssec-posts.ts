#!/usr/bin/env npx tsx
/**
 * Skills Sec Content Generator
 *
 * Reads daily scan batch results and generates social media posts
 * for the Skills Sec brand (security awareness) and PanGuard official brand.
 *
 * Two brands, different tones:
 *   - Skills Sec:  direct, alarming, educational — "this skill steals your SSH keys"
 *   - PanGuard:    professional, data-driven — "this week we scanned 247 skills..."
 *
 * Output:
 *   posts/YYYY-MM-DD/
 *     ├── skillssec-{n}-short.md    (X / Threads — <280 chars)
 *     ├── skillssec-{n}-long.md     (Reddit / LinkedIn / WeChat)
 *     ├── panguard-weekly.md        (official weekly summary)
 *     └── manifest.json             (metadata for publishing automation)
 *
 * Usage:
 *   npx tsx scripts/generate-skillssec-posts.ts --input data/scan-batch-20260325.json
 *   npx tsx scripts/generate-skillssec-posts.ts --input data/scan-cumulative.json --weekly
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanResult {
  package: string;
  version: string;
  riskScore: number;
  riskLevel: string;
  tools: Array<{ name: string; description: string; dangerousPatterns?: string[] }>;
  supplyChain: { typosquatRisk: boolean; similarTo?: string; hasPostInstall: boolean; suspiciousName?: boolean };
  codeAnalysis: {
    outboundUrls: string[];
    shellExecution: boolean;
    fileSystemWrite: boolean;
    networkRequests: boolean;
    envAccess: string[];
    dangerousImports: string[];
  };
  atrMatches: Array<{ ruleId: string; severity: string; title: string; matchedOn?: string }>;
  genuineThreats: string[];
  auditedAt: string;
}

interface PostManifest {
  generatedAt: string;
  batchFile: string;
  posts: Array<{
    id: string;
    brand: 'skillssec' | 'panguard';
    type: 'short' | 'long' | 'weekly';
    package: string;
    riskLevel: string;
    platforms: string[];
    file: string;
  }>;
}

// ---------------------------------------------------------------------------
// Threat Impact Explainer (white-language)
//
// Maps technical findings to plain-language consequences.
// This is the core value: making security threats understandable.
// ---------------------------------------------------------------------------

interface ThreatExplanation {
  whatItDoes: string;      // technical fact
  whatHappens: string;     // consequence for the user
  whoIsAffected: string;   // who should care
}

function explainThreats(result: ScanResult): ThreatExplanation[] {
  const explanations: ThreatExplanation[] = [];
  const seen = new Set<string>();

  // ATR rule matches — highest signal
  for (const match of result.atrMatches) {
    const key = match.ruleId;
    if (seen.has(key)) continue;
    seen.add(key);

    const explanation = explainATRRule(match.ruleId, match.title, match.matchedOn);
    if (explanation) explanations.push(explanation);
  }

  // Supply chain risks
  if (result.supplyChain.typosquatRisk && !seen.has('typosquat')) {
    seen.add('typosquat');
    explanations.push({
      whatItDoes: `Package name is suspiciously similar to "${result.supplyChain.similarTo}"`,
      whatHappens: 'You might install a malicious copycat package by mistake. The attacker banks on typos.',
      whoIsAffected: `Anyone searching for "${result.supplyChain.similarTo}" on npm`,
    });
  }

  if (result.supplyChain.hasPostInstall && !seen.has('postinstall')) {
    seen.add('postinstall');
    explanations.push({
      whatItDoes: 'Runs code automatically when you `npm install` (postinstall script)',
      whatHappens: 'Malicious code executes before you even use the package. No consent, no review.',
      whoIsAffected: 'Anyone who installs this package',
    });
  }

  // Code analysis combinations
  if (result.codeAnalysis.shellExecution && result.codeAnalysis.networkRequests && !seen.has('shell+net')) {
    seen.add('shell+net');
    explanations.push({
      whatItDoes: 'Executes shell commands AND makes network requests',
      whatHappens: 'Can run any command on your machine and send the results to an external server (RCE + exfiltration).',
      whoIsAffected: 'Your entire machine is at risk',
    });
  }

  // Dangerous tool descriptions
  for (const tool of result.tools) {
    if (tool.dangerousPatterns?.includes('instruction-override') && !seen.has('inject-' + tool.name)) {
      seen.add('inject-' + tool.name);
      explanations.push({
        whatItDoes: `Tool "${tool.name}" contains instruction-override keywords in its description`,
        whatHappens: 'Can manipulate the AI agent to ignore safety rules and execute unauthorized actions.',
        whoIsAffected: 'Anyone using this MCP skill with Claude, Cursor, or any AI agent',
      });
    }
  }

  return explanations;
}

/** Map ATR rule IDs to human-readable explanations */
function explainATRRule(ruleId: string, title: string, matchedOn?: string): ThreatExplanation | null {
  const toolName = matchedOn?.replace('tool:', '') ?? 'unknown tool';

  // Category-based explanations
  if (ruleId.includes('021') || title.toLowerCase().includes('credential') || title.toLowerCase().includes('api key')) {
    return {
      whatItDoes: `Exposes API keys, passwords, or tokens (detected in: ${toolName})`,
      whatHappens: 'Your credentials can be stolen. Attacker gets access to your cloud accounts, databases, or paid APIs.',
      whoIsAffected: 'Anyone with API keys in their environment (.env files, shell config)',
    };
  }

  if (title.toLowerCase().includes('ssh') || title.toLowerCase().includes('private key')) {
    return {
      whatItDoes: `Reads SSH private keys or certificate files (detected in: ${toolName})`,
      whatHappens: 'Attacker can access all servers you connect to via SSH. Full remote server compromise.',
      whoIsAffected: 'Developers who SSH into servers, deploy via git, or use SSH tunnels',
    };
  }

  if (title.toLowerCase().includes('prompt injection') || title.toLowerCase().includes('instruction override')) {
    return {
      whatItDoes: `Contains hidden instructions to manipulate the AI agent (detected in: ${toolName})`,
      whatHappens: 'The AI agent may execute unauthorized actions: delete files, send data, bypass safety checks.',
      whoIsAffected: 'Anyone using AI agents (Claude Code, Cursor, Windsurf) with this skill installed',
    };
  }

  if (title.toLowerCase().includes('exfiltration') || title.toLowerCase().includes('data leak')) {
    return {
      whatItDoes: `Sends your data to external servers without consent (detected in: ${toolName})`,
      whatHappens: 'Source code, secrets, and personal files can be silently uploaded to attacker-controlled servers.',
      whoIsAffected: 'Anyone working on proprietary code or with sensitive files on their machine',
    };
  }

  if (title.toLowerCase().includes('tool poisoning') || title.toLowerCase().includes('malicious response')) {
    return {
      whatItDoes: `Returns manipulated results to trick the AI agent (detected in: ${toolName})`,
      whatHappens: 'The AI agent trusts poisoned output and may make wrong decisions or execute harmful follow-up actions.',
      whoIsAffected: 'Anyone relying on this tool\'s output for automated workflows',
    };
  }

  if (title.toLowerCase().includes('supply chain') || title.toLowerCase().includes('typosquat')) {
    return {
      whatItDoes: `Supply chain attack vector detected (detected in: ${toolName})`,
      whatHappens: 'Installing this package may install a malicious dependency or execute code during installation.',
      whoIsAffected: 'Anyone installing MCP packages from npm or GitHub',
    };
  }

  // Generic fallback
  return {
    whatItDoes: `${title} (detected in: ${toolName})`,
    whatHappens: 'This MCP skill exhibits behavior that could compromise your security.',
    whoIsAffected: 'Anyone using this skill with an AI agent',
  };
}

// ---------------------------------------------------------------------------
// Post Generators
// ---------------------------------------------------------------------------

function generateShortPost(result: ScanResult, explanations: ThreatExplanation[]): string {
  const topExplanation = explanations[0];
  if (!topExplanation) return '';

  const severityTag = result.riskLevel === 'CRITICAL' ? '[CRITICAL]' : '[HIGH]';
  const pkg = result.package;

  // Keep under 280 chars for X/Threads
  const lines: string[] = [];
  lines.push(`${severityTag} MCP Skill "${pkg}" flagged`);
  lines.push('');
  lines.push(topExplanation.whatItDoes);
  lines.push('');
  lines.push(`Impact: ${topExplanation.whatHappens.split('.')[0]}.`);
  lines.push('');
  lines.push(`ATR Rule: ${result.atrMatches[0]?.ruleId ?? 'behavioral-analysis'}`);
  lines.push('Scan: panguard.ai');
  lines.push('');
  lines.push('#MCP #AISecurity #SkillsSec #AgentSafety');

  return lines.join('\n');
}

function generateLongPost(result: ScanResult, explanations: ThreatExplanation[]): string {
  const pkg = result.package;
  const version = result.version;
  const score = result.riskScore;

  const lines: string[] = [];
  lines.push(`# ${result.riskLevel}: MCP Skill "${pkg}" v${version}`);
  lines.push('');
  lines.push(`Risk Score: ${score}/100 | Level: ${result.riskLevel}`);
  lines.push(`Tools exposed: ${result.tools.length} | Scanned: ${result.auditedAt.split('T')[0]}`);
  lines.push('');

  lines.push('## What We Found');
  lines.push('');

  for (let i = 0; i < explanations.length; i++) {
    const e = explanations[i]!;
    lines.push(`### ${i + 1}. ${e.whatItDoes}`);
    lines.push('');
    lines.push(`**What happens:** ${e.whatHappens}`);
    lines.push('');
    lines.push(`**Who is affected:** ${e.whoIsAffected}`);
    lines.push('');
  }

  if (result.atrMatches.length > 0) {
    lines.push('## ATR Rules Triggered');
    lines.push('');
    for (const m of result.atrMatches) {
      lines.push(`- **${m.ruleId}** ${m.title} (${m.severity})`);
    }
    lines.push('');
  }

  lines.push('## How to Protect Yourself');
  lines.push('');
  lines.push('1. Do NOT install this skill until the issues are resolved');
  lines.push('2. If already installed, remove it immediately');
  lines.push('3. Check if your credentials were exposed — rotate any API keys');
  lines.push('4. Scan your installed skills: `npx @panguard-ai/panguard audit`');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('Detected by ATR (Agent Threat Rules) — the open standard for AI agent security.');
  lines.push('Full threat report available via Threat Cloud API: tc.panguard.ai');
  lines.push('');
  lines.push('Scan your skills for free: panguard.ai');

  return lines.join('\n');
}

function generateChinesePost(result: ScanResult, explanations: ThreatExplanation[]): string {
  const pkg = result.package;

  const lines: string[] = [];
  lines.push(`[${result.riskLevel}] MCP Skill "${pkg}" 安全警報`);
  lines.push('');
  lines.push(`風險分數: ${result.riskScore}/100`);
  lines.push('');

  lines.push('## 發現了什麼');
  lines.push('');

  for (const e of explanations) {
    lines.push(`- **做了什麼:** ${e.whatItDoes}`);
    lines.push(`- **後果:** ${e.whatHappens}`);
    lines.push(`- **誰受影響:** ${e.whoIsAffected}`);
    lines.push('');
  }

  lines.push('## 如何保護自己');
  lines.push('');
  lines.push('1. 不要安裝這個 skill');
  lines.push('2. 如果已安裝，立即移除');
  lines.push('3. 檢查你的 API Key 是否已洩漏，立即輪換');
  lines.push('4. 掃描你的 skills: `npx @panguard-ai/panguard audit`');
  lines.push('');
  lines.push('---');
  lines.push('由 ATR（Agent Threat Rules）開放標準偵測。');
  lines.push('完整報告: tc.panguard.ai');

  return lines.join('\n');
}

function generateWeeklySummary(
  results: ScanResult[],
  dateRange: string,
): string {
  const total = results.length;
  const critical = results.filter(r => r.riskLevel === 'CRITICAL');
  const high = results.filter(r => r.riskLevel === 'HIGH');
  const clean = results.filter(r => r.riskLevel === 'CLEAN' || r.riskLevel === 'LOW');
  const flagged = [...critical, ...high];
  const totalTools = results.reduce((s, r) => s + (r.tools?.length ?? 0), 0);
  const threatRate = total > 0 ? Math.round(flagged.length / total * 100) : 0;

  const lines: string[] = [];
  lines.push(`# PanGuard Weekly Ecosystem Report — ${dateRange}`);
  lines.push('');
  lines.push(`This week we scanned **${total}** MCP skills and extracted **${totalTools}** tool definitions.`);
  lines.push('');
  lines.push('## Key Numbers');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total scanned | ${total} |`);
  lines.push(`| CRITICAL | ${critical.length} |`);
  lines.push(`| HIGH | ${high.length} |`);
  lines.push(`| CLEAN/LOW | ${clean.length} |`);
  lines.push(`| Threat rate | ${threatRate}% |`);
  lines.push(`| Tools analyzed | ${totalTools} |`);
  lines.push('');

  if (flagged.length > 0) {
    lines.push('## Notable Threats');
    lines.push('');
    for (const r of flagged.slice(0, 10)) {
      const topThreat = r.genuineThreats?.[0] ?? r.atrMatches?.[0]?.title ?? 'behavioral analysis';
      lines.push(`- **[${r.riskLevel}] ${r.package}** v${r.version} (score: ${r.riskScore}) — ${topThreat.split('.')[0]}`);
    }
    if (flagged.length > 10) {
      lines.push(`- ...and ${flagged.length - 10} more`);
    }
    lines.push('');
  }

  lines.push('## What This Means');
  lines.push('');
  lines.push(`${threatRate}% of scanned MCP skills show security concerns. ` +
    'Most common issues: credential access patterns, shell execution with network requests, ' +
    'and tool descriptions containing instruction-override keywords.');
  lines.push('');
  lines.push('## Protect Yourself');
  lines.push('');
  lines.push('- Scan before you install: `npx @panguard-ai/panguard audit`');
  lines.push('- 24/7 monitoring: `npx @panguard-ai/panguard guard start`');
  lines.push('- Check any skill: panguard.ai');
  lines.push('');
  lines.push('---');
  lines.push('Data from ATR (Agent Threat Rules) daily ecosystem scan.');
  lines.push('All rules are open source: github.com/panguard-ai/agent-threat-rules');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const inputIdx = process.argv.indexOf('--input');
  const inputPath = inputIdx >= 0
    ? resolve(process.argv[inputIdx + 1]!)
    : resolve('data/scan-batch-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.json');

  const isWeekly = process.argv.includes('--weekly');

  const outputIdx = process.argv.indexOf('--output-dir');
  const dateStr = new Date().toISOString().slice(0, 10);
  const outputDir = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('posts', dateStr);

  if (!existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    // Try to find the latest batch file
    const dataDir = resolve('data');
    if (existsSync(dataDir)) {
      const batches = readdirSync(dataDir).filter(f => f.startsWith('scan-batch-')).sort();
      if (batches.length > 0) {
        console.log(`  Tip: use --input data/${batches[batches.length - 1]}`);
      }
    }
    process.exit(1);
  }

  mkdirSync(outputDir, { recursive: true });

  const data = JSON.parse(readFileSync(inputPath, 'utf-8'));
  const results: ScanResult[] = data.results ?? [];

  console.log(`\n  Skills Sec Content Generator`);
  console.log(`  Input: ${inputPath}`);
  console.log(`  Packages: ${results.length}`);
  console.log(`  Output: ${outputDir}\n`);

  const manifest: PostManifest = {
    generatedAt: new Date().toISOString(),
    batchFile: inputPath,
    posts: [],
  };

  // --- Generate per-threat posts for CRITICAL and HIGH ---
  const flagged = results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');
  console.log(`  Flagged (CRITICAL+HIGH): ${flagged.length}`);

  let postIndex = 0;

  for (const result of flagged) {
    const explanations = explainThreats(result);
    if (explanations.length === 0) continue;

    postIndex++;
    const prefix = `skillssec-${String(postIndex).padStart(3, '0')}`;

    // Short post (X / Threads)
    const shortPost = generateShortPost(result, explanations);
    const shortFile = `${prefix}-short.md`;
    writeFileSync(join(outputDir, shortFile), shortPost, 'utf-8');
    manifest.posts.push({
      id: `${dateStr}-${prefix}-short`,
      brand: 'skillssec',
      type: 'short',
      package: result.package,
      riskLevel: result.riskLevel,
      platforms: ['x', 'threads'],
      file: shortFile,
    });

    // Long post (Reddit / LinkedIn)
    const longPost = generateLongPost(result, explanations);
    const longFile = `${prefix}-long.md`;
    writeFileSync(join(outputDir, longFile), longPost, 'utf-8');
    manifest.posts.push({
      id: `${dateStr}-${prefix}-long`,
      brand: 'skillssec',
      type: 'long',
      package: result.package,
      riskLevel: result.riskLevel,
      platforms: ['reddit', 'linkedin', 'hackernews'],
      file: longFile,
    });

    // Chinese post (PTT / Dcard / WeChat)
    const zhPost = generateChinesePost(result, explanations);
    const zhFile = `${prefix}-zh.md`;
    writeFileSync(join(outputDir, zhFile), zhPost, 'utf-8');
    manifest.posts.push({
      id: `${dateStr}-${prefix}-zh`,
      brand: 'skillssec',
      type: 'long',
      package: result.package,
      riskLevel: result.riskLevel,
      platforms: ['ptt', 'dcard', 'wechat', 'threads-zh'],
      file: zhFile,
    });

    console.log(`  [${result.riskLevel}] ${result.package} → 3 posts`);
  }

  // --- Weekly summary (PanGuard official brand) ---
  if (isWeekly || flagged.length > 0) {
    const weeklyPost = generateWeeklySummary(results, dateStr);
    const weeklyFile = 'panguard-weekly.md';
    writeFileSync(join(outputDir, weeklyFile), weeklyPost, 'utf-8');
    manifest.posts.push({
      id: `${dateStr}-panguard-weekly`,
      brand: 'panguard',
      type: 'weekly',
      package: '*',
      riskLevel: '*',
      platforms: ['linkedin', 'x', 'reddit', 'wechat'],
      file: weeklyFile,
    });
    console.log(`  [WEEKLY] PanGuard summary → 1 post`);
  }

  // --- Save manifest ---
  writeFileSync(
    join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );

  // --- Summary ---
  console.log('\n  ==============================');
  console.log('  CONTENT GENERATION SUMMARY');
  console.log('  ==============================');
  console.log(`  Total posts generated: ${manifest.posts.length}`);
  console.log(`    Skills Sec (short): ${manifest.posts.filter(p => p.type === 'short').length}`);
  console.log(`    Skills Sec (long):  ${manifest.posts.filter(p => p.type === 'long').length}`);
  console.log(`    PanGuard (weekly):  ${manifest.posts.filter(p => p.type === 'weekly').length}`);
  console.log(`  Output: ${outputDir}`);
  console.log(`  Manifest: ${join(outputDir, 'manifest.json')}`);
  console.log('');
  console.log('  Next step: review posts, then publish with:');
  console.log('    npx tsx scripts/publish-posts.ts --dir ' + outputDir);
  console.log('');
}

main();
