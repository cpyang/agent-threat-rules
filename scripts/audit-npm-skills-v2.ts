#!/usr/bin/env npx tsx
/**
 * MCP Skill Auditor v2 — First Principles Approach
 *
 * Instead of scanning README/docs (high false positive),
 * we extract and scan what actually matters:
 *
 *   1. MCP tool descriptions (where injection lives)
 *   2. MCP tool schemas (where excessive permissions live)
 *   3. Package name analysis (where supply chain attacks live)
 *   4. Outbound URL patterns in built JS (where exfiltration lives)
 *
 * Usage:
 *   npx tsx scripts/audit-npm-skills-v2.ts [--limit 50] [--output audit-v2.json]
 */

import { execSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync, rmSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractedTool {
  name: string;
  description: string;
  schemaProperties: string[];
  dangerousPatterns: string[];
}

interface SupplyChainCheck {
  typosquatRisk: boolean;
  similarTo?: string;
  suspiciousName: boolean;
  hasPostInstall: boolean;
}

interface CodeAnalysis {
  outboundUrls: string[];
  shellExecution: boolean;
  fileSystemWrite: boolean;
  networkRequests: boolean;
  envAccess: string[];
  dangerousImports: string[];
}

interface AuditV2Result {
  package: string;
  version: string;
  url: string;
  // What we found
  tools: ExtractedTool[];
  supplyChain: SupplyChainCheck;
  codeAnalysis: CodeAnalysis;
  atrMatches: Array<{ ruleId: string; severity: string; title: string; matchedOn: string }>;
  // Verdict
  riskScore: number;
  riskLevel: string;
  genuineThreats: string[];
  falsePositiveReasons: string[];
  auditedAt: string;
}

// ---------------------------------------------------------------------------
// Tool Description Extraction
// ---------------------------------------------------------------------------

function extractToolDescriptions(packageDir: string): ExtractedTool[] {
  const tools: ExtractedTool[] = [];

  // Strategy: search built JS files for MCP tool registration patterns
  const searchDirs = [
    join(packageDir, 'dist'),
    join(packageDir, 'build'),
    join(packageDir, 'lib'),
    packageDir, // root level JS files
  ];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir, { recursive: true })
      .map(f => String(f))
      .filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
      .slice(0, 20); // limit to 20 files

    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        if (content.length > 500_000) continue; // skip huge files

        // Pattern 1: MCP SDK style — { name: "...", description: "...", inputSchema: {...} }
        const toolPattern = /name\s*:\s*["'`]([^"'`]+)["'`]\s*,\s*description\s*:\s*["'`]([^"'`]+)["'`]/g;
        let match;
        while ((match = toolPattern.exec(content)) !== null) {
          const name = match[1]!;
          const desc = match[2]!;

          // Extract schema properties nearby (within 500 chars)
          const nearby = content.slice(match.index, match.index + 1000);
          const propMatches = [...nearby.matchAll(/["'](\w+)["']\s*:\s*\{[^}]*type\s*:\s*["'](\w+)["']/g)];
          const schemaProperties = propMatches.map(m => `${m[1]}:${m[2]}`);

          // Check for dangerous patterns in description
          const dangerousPatterns: string[] = [];
          if (/ignore|disregard|override|forget/i.test(desc)) dangerousPatterns.push('instruction-override');
          if (/system|admin|root|sudo/i.test(desc)) dangerousPatterns.push('privilege-keywords');
          if (/secret|key|password|token|credential/i.test(desc)) dangerousPatterns.push('credential-access');
          if (/execute|eval|run.*command|shell/i.test(desc)) dangerousPatterns.push('code-execution');
          if (/delete|remove|drop|truncate|format/i.test(desc)) dangerousPatterns.push('destructive-action');

          tools.push({ name, description: desc.slice(0, 500), schemaProperties, dangerousPatterns });
        }

        // Pattern 2: Tool array style — tools: [{ name, description }]
        const arrayPattern = /["']name["']\s*:\s*["']([^"']+)["'][^}]*["']description["']\s*:\s*["']([^"']+)["']/g;
        while ((match = arrayPattern.exec(content)) !== null) {
          const name = match[1]!;
          const desc = match[2]!;
          if (tools.some(t => t.name === name)) continue; // dedup
          tools.push({ name, description: desc.slice(0, 500), schemaProperties: [], dangerousPatterns: [] });
        }

      } catch { /* skip unreadable files */ }
    }
  }

  return tools;
}

// ---------------------------------------------------------------------------
// Supply Chain Analysis
// ---------------------------------------------------------------------------

const WELL_KNOWN_PACKAGES = [
  '@modelcontextprotocol/sdk', 'fastmcp', 'mcp-server',
  '@anthropic-ai/sdk', 'playwright', 'puppeteer',
  'express', 'axios', 'node-fetch',
];

function analyzeSupplyChain(packageName: string, packageDir: string): SupplyChainCheck {
  // Check for typosquatting against well-known MCP packages
  const knownMCPNames = [
    'modelcontextprotocol', 'mcp-server-filesystem', 'mcp-server-github',
    'mcp-server-postgres', 'mcp-server-puppeteer', 'mcp-server-brave-search',
    'mcp-server-fetch', 'mcp-server-sqlite', 'mcp-server-gdrive',
  ];

  let typosquatRisk = false;
  let similarTo: string | undefined;
  for (const known of knownMCPNames) {
    if (packageName !== known && levenshtein(packageName.split('/').pop()!, known) <= 2) {
      typosquatRisk = true;
      similarTo = known;
      break;
    }
  }

  // Check for suspicious name patterns
  const suspiciousName = /^[a-z]{1,3}-[a-z]{1,3}$|test|hack|exploit|crack/i.test(
    packageName.split('/').pop()!
  );

  // Check for postinstall scripts
  let hasPostInstall = false;
  try {
    const pj = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'));
    hasPostInstall = !!(pj.scripts?.postinstall || pj.scripts?.preinstall || pj.scripts?.install);
  } catch { /* ignore */ }

  return { typosquatRisk, similarTo, suspiciousName, hasPostInstall };
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i-1] === b[j-1]
        ? dp[i-1]![j-1]!
        : 1 + Math.min(dp[i-1]![j]!, dp[i]![j-1]!, dp[i-1]![j-1]!);
    }
  }
  return dp[m]![n]!;
}

// ---------------------------------------------------------------------------
// Code Analysis (static, no execution)
// ---------------------------------------------------------------------------

function analyzeCode(packageDir: string): CodeAnalysis {
  const result: CodeAnalysis = {
    outboundUrls: [],
    shellExecution: false,
    fileSystemWrite: false,
    networkRequests: false,
    envAccess: [],
    dangerousImports: [],
  };

  const dirs = [join(packageDir, 'dist'), join(packageDir, 'lib'), packageDir];

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir, { recursive: true })
      .map(f => String(f))
      .filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
      .slice(0, 15);

    for (const file of files) {
      try {
        const content = readFileSync(join(dir, file), 'utf-8');
        if (content.length > 300_000) continue;

        // Outbound URLs (excluding common safe domains)
        const urlMatches = content.match(/https?:\/\/[^\s"'`\\)}\]]+/g) ?? [];
        for (const url of urlMatches) {
          if (/localhost|127\.0\.0\.1|example\.com|github\.com|npmjs|googleapis|anthropic|openai/i.test(url)) continue;
          if (!result.outboundUrls.includes(url)) result.outboundUrls.push(url);
        }

        // Shell execution
        if (/child_process|exec\s*\(|execSync|spawn\s*\(|spawnSync/i.test(content)) {
          result.shellExecution = true;
        }

        // Filesystem write
        if (/writeFile|writeFileSync|appendFile|createWriteStream|fs\.write/i.test(content)) {
          result.fileSystemWrite = true;
        }

        // Network requests
        if (/fetch\s*\(|axios|node-fetch|http\.request|https\.request/i.test(content)) {
          result.networkRequests = true;
        }

        // Environment variable access
        const envMatches = content.match(/process\.env\[?["'](\w+)["']\]?/g) ?? [];
        for (const e of envMatches) {
          const key = e.match(/["'](\w+)["']/)?.[1];
          if (key && !result.envAccess.includes(key)) result.envAccess.push(key);
        }

        // Dangerous imports
        if (/require\s*\(\s*["']child_process["']\)/i.test(content)) result.dangerousImports.push('child_process');
        if (/require\s*\(\s*["']net["']\)/i.test(content)) result.dangerousImports.push('net');
        if (/require\s*\(\s*["']dgram["']\)/i.test(content)) result.dangerousImports.push('dgram');

      } catch { /* skip */ }
    }
  }

  // Deduplicate
  result.outboundUrls = [...new Set(result.outboundUrls)].slice(0, 20);
  result.envAccess = [...new Set(result.envAccess)].slice(0, 20);
  result.dangerousImports = [...new Set(result.dangerousImports)];

  return result;
}

// ---------------------------------------------------------------------------
// ATR Scan (only on tool descriptions, not README)
// ---------------------------------------------------------------------------

async function scanWithATR(
  tools: ExtractedTool[],
  engine: { evaluate: (event: Record<string, unknown>) => Array<Record<string, unknown>> },
): Promise<AuditV2Result['atrMatches']> {
  const matches: AuditV2Result['atrMatches'] = [];
  const seen = new Set<string>();

  for (const tool of tools) {
    // Scan tool description as mcp_exchange (correct event type)
    const results = engine.evaluate({
      type: 'mcp_exchange',
      source: 'mcp_tool',
      content: tool.description,
      timestamp: new Date().toISOString(),
      fields: {
        tool_name: tool.name,
        tool_args: tool.description,
      },
    }) as Array<{ rule: { id: string; severity: string; title: string } }>;

    for (const r of results) {
      const key = `${r.rule.id}:${tool.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        ruleId: r.rule.id,
        severity: r.rule.severity,
        title: r.rule.title,
        matchedOn: `tool:${tool.name}`,
      });
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

function computeVerdict(
  tools: ExtractedTool[],
  supplyChain: SupplyChainCheck,
  codeAnalysis: CodeAnalysis,
  atrMatches: AuditV2Result['atrMatches'],
): { riskScore: number; riskLevel: string; genuineThreats: string[]; falsePositiveReasons: string[] } {
  const genuineThreats: string[] = [];
  const falsePositiveReasons: string[] = [];
  let score = 0;

  // Supply chain
  if (supplyChain.typosquatRisk) {
    genuineThreats.push(`Typosquat risk: similar to "${supplyChain.similarTo}"`);
    score += 30;
  }
  if (supplyChain.hasPostInstall) {
    genuineThreats.push('Has postinstall script (auto-executes on npm install)');
    score += 15;
  }

  // Tool description injection (ATR matches on DESCRIPTIONS, not docs)
  for (const m of atrMatches) {
    if (m.severity === 'critical') {
      genuineThreats.push(`${m.ruleId}: ${m.title} (in tool: ${m.matchedOn})`);
      score += 25;
    } else if (m.severity === 'high') {
      genuineThreats.push(`${m.ruleId}: ${m.title} (in tool: ${m.matchedOn})`);
      score += 15;
    }
  }

  // Tool descriptions with dangerous patterns
  for (const tool of tools) {
    for (const pattern of tool.dangerousPatterns) {
      if (pattern === 'instruction-override') {
        genuineThreats.push(`Tool "${tool.name}" description contains instruction override keywords`);
        score += 25;
      }
      if (pattern === 'credential-access') {
        // This is often legitimate (password manager tools, etc.)
        // Only flag if combined with network requests
        if (codeAnalysis.networkRequests) {
          genuineThreats.push(`Tool "${tool.name}" accesses credentials AND makes network requests`);
          score += 20;
        } else {
          falsePositiveReasons.push(`Tool "${tool.name}" mentions credentials but no outbound network (likely safe)`);
        }
      }
    }
  }

  // Code analysis
  if (codeAnalysis.shellExecution && codeAnalysis.networkRequests) {
    genuineThreats.push('Shell execution + network requests (potential RCE + exfiltration)');
    score += 10;
  }
  if (codeAnalysis.outboundUrls.length > 5) {
    genuineThreats.push(`${codeAnalysis.outboundUrls.length} outbound URLs found`);
    score += 5;
  }

  score = Math.min(100, score);
  const riskLevel = score >= 70 ? 'CRITICAL' :
                    score >= 40 ? 'HIGH' :
                    score >= 15 ? 'MEDIUM' :
                    score > 0  ? 'LOW' : 'CLEAN';

  return { riskScore: score, riskLevel, genuineThreats, falsePositiveReasons };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

async function main(): Promise<void> {
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1]!, 10) : 50;

  const outputIdx = process.argv.indexOf('--output');
  const outputPath = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('audit-v2.json');

  // Load registry
  if (!existsSync('mcp-registry.json')) {
    console.error('Run crawl-mcp-registry.ts first');
    process.exit(1);
  }
  const registry = JSON.parse(readFileSync('mcp-registry.json', 'utf-8'));
  const packages = registry.entries
    .filter((e: Record<string, unknown>) => e.npmPackage)
    .map((e: Record<string, unknown>) => ({ name: e.npmPackage as string, url: e.url as string }))
    .slice(0, limit);

  // Load ATR engine
  const { ATREngine } = await import('../dist/engine.js');
  const engine = new ATREngine({ rulesDir: resolve('rules') });
  await engine.loadRules();

  console.log(`\n  MCP Skill Auditor v2 (First Principles)`);
  console.log(`  ATR rules: 52 | Packages: ${packages.length}`);
  console.log(`  Scanning: tool descriptions, schemas, supply chain, code patterns`);
  console.log(`  NOT scanning: README, docs, examples\n`);

  const workDir = join(tmpdir(), 'atr-audit-v2');
  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const results: AuditV2Result[] = [];

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i]!;
    const pct = Math.round(((i + 1) / packages.length) * 100);
    process.stdout.write(`\r  [${pct}%] ${i + 1}/${packages.length}: ${pkg.name}`.padEnd(80));

    const pkgDir = join(workDir, pkg.name.replace(/[/@]/g, '_'));
    mkdirSync(pkgDir, { recursive: true });

    try {
      // Download
      execSync(`npm pack ${pkg.name} --pack-destination "${pkgDir}" 2>/dev/null`, {
        timeout: 30000, stdio: 'pipe',
      });

      const tarballs = readdirSync(pkgDir).filter(f => f.endsWith('.tgz'));
      if (tarballs.length === 0) continue;

      const extractDir = join(pkgDir, 'ex');
      mkdirSync(extractDir, { recursive: true });
      execSync(`tar xzf "${join(pkgDir, tarballs[0]!)}" -C "${extractDir}" 2>/dev/null`, {
        timeout: 10000, stdio: 'pipe',
      });

      const packageDir = join(extractDir, 'package');
      if (!existsSync(packageDir)) continue;

      // Get version
      let version = '?';
      try {
        const pj = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'));
        version = pj.version ?? '?';
      } catch { /* */ }

      // Phase 1: Extract tool descriptions
      const tools = extractToolDescriptions(packageDir);

      // Phase 2: Supply chain analysis
      const supplyChain = analyzeSupplyChain(pkg.name, packageDir);

      // Phase 3: Code analysis
      const codeAnalysis = analyzeCode(packageDir);

      // Phase 4: ATR scan on tool descriptions ONLY
      const atrMatches = await scanWithATR(tools, engine);

      // Phase 5: Verdict
      const verdict = computeVerdict(tools, supplyChain, codeAnalysis, atrMatches);

      results.push({
        package: pkg.name,
        version,
        url: pkg.url,
        tools,
        supplyChain,
        codeAnalysis,
        atrMatches,
        ...verdict,
        auditedAt: new Date().toISOString(),
      });

    } catch {
      results.push({
        package: pkg.name, version: '?', url: pkg.url,
        tools: [], supplyChain: { typosquatRisk: false, suspiciousName: false, hasPostInstall: false },
        codeAnalysis: { outboundUrls: [], shellExecution: false, fileSystemWrite: false, networkRequests: false, envAccess: [], dangerousImports: [] },
        atrMatches: [], riskScore: -1, riskLevel: 'ERROR', genuineThreats: [], falsePositiveReasons: [],
        auditedAt: new Date().toISOString(),
      });
    }
  }

  process.stdout.write('\r'.padEnd(80) + '\r');
  try { rmSync(workDir, { recursive: true, force: true }); } catch { /* */ }

  // Summary
  const byLevel: Record<string, number> = {};
  for (const r of results) byLevel[r.riskLevel] = (byLevel[r.riskLevel] ?? 0) + 1;

  const totalTools = results.reduce((sum, r) => sum + r.tools.length, 0);
  const flagged = results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');

  console.log('\n  ══════════════════════════════════════════════════');
  console.log('  MCP AUDIT v2 — First Principles Results');
  console.log('  ══════════════════════════════════════════════════');
  console.log(`  Packages scanned: ${results.length}`);
  console.log(`  MCP tools extracted: ${totalTools}`);
  for (const [level, count] of Object.entries(byLevel).sort())
    console.log(`    ${level}: ${count}`);

  if (flagged.length > 0) {
    console.log('\n  GENUINE THREATS FOUND:');
    for (const r of flagged) {
      console.log(`\n  [${r.riskLevel}] ${r.package} v${r.version} (score: ${r.riskScore})`);
      console.log(`    Tools: ${r.tools.map(t => t.name).join(', ') || 'none extracted'}`);
      for (const t of r.genuineThreats)
        console.log(`    ! ${t}`);
      if (r.falsePositiveReasons.length > 0) {
        for (const fp of r.falsePositiveReasons)
          console.log(`    ~ ${fp}`);
      }
    }
  }

  const clean = results.filter(r => r.riskLevel === 'CLEAN' || r.riskLevel === 'LOW');
  if (clean.length > 0) {
    console.log(`\n  CLEAN/LOW (${clean.length}): ${clean.map(r => r.package).join(', ')}`);
  }

  writeFileSync(outputPath, JSON.stringify({ auditedAt: new Date().toISOString(), total: results.length, summary: byLevel, flagged: flagged.length, totalTools, results }, null, 2));
  console.log(`\n  Saved: ${outputPath}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
