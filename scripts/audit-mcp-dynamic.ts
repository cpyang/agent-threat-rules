#!/usr/bin/env npx tsx
/**
 * MCP Dynamic Auditor — Level 1 (tools/list only, no tool execution)
 *
 * Starts each MCP server as a child process, sends tools/list via
 * MCP SDK client, extracts tool descriptions and schemas directly
 * from the running server, then scans with ATR engine.
 *
 * This eliminates false positives from README/doc parsing by scanning
 * what the LLM actually sees (tool descriptions), not documentation.
 *
 * Limitations (honest):
 * - Accuracy depends on server honesty. A deliberately deceptive server
 *   can report clean descriptions but behave maliciously at runtime.
 * - Dynamic tool registration (tools added after Nth call) is invisible.
 * - Anti-analysis (detect CI environment, behave differently) can evade.
 * - Semantic paraphrase in descriptions bypasses ATR regex patterns.
 * - Level 2 (sandbox + runtime monitoring) needed for full coverage.
 *
 * Safe: only reads tool metadata. Does NOT call any tools.
 *
 * Usage:
 *   npx tsx scripts/audit-mcp-dynamic.ts [--limit 20] [--output dynamic-audit.json]
 */

import { execSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, writeFileSync, rmSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DynamicTool {
  name: string;
  description: string;
  schemaProperties: string[];
}

interface DynamicAuditResult {
  package: string;
  version: string;
  url: string;
  // Connection
  connected: boolean;
  connectionError?: string;
  // Tools from server
  tools: DynamicTool[];
  toolCount: number;
  // ATR scan of tool descriptions
  atrMatches: Array<{ ruleId: string; severity: string; title: string; toolName: string }>;
  // Supply chain
  typosquatRisk: boolean;
  similarTo?: string;
  hasPostInstall: boolean;
  // Verdict
  riskScore: number;
  riskLevel: string;
  threats: string[];
  auditedAt: string;
}

// ---------------------------------------------------------------------------
// MCP Connection
// ---------------------------------------------------------------------------

async function listToolsFromServer(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number = 10_000,
): Promise<{ tools: DynamicTool[]; error?: string }> {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;

  try {
    transport = new StdioClientTransport({
      command,
      args,
      cwd,
      stderr: 'pipe', // don't spam console
    });

    client = new Client(
      { name: 'atr-auditor', version: '0.1.0' },
      { capabilities: {} },
    );

    // Race: connect vs timeout
    const connectPromise = client.connect(transport);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    // List tools
    const listPromise = client.listTools();
    const listTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('ListTools timeout')), 5_000)
    );

    const result = await Promise.race([listPromise, listTimeout]);

    const tools: DynamicTool[] = (result.tools ?? []).map((t: Record<string, unknown>) => {
      const schema = t.inputSchema as Record<string, unknown> | undefined;
      const properties = schema?.properties as Record<string, unknown> | undefined;
      const schemaProperties = properties
        ? Object.entries(properties).map(([k, v]) => `${k}:${(v as Record<string, unknown>)?.type ?? '?'}`)
        : [];

      return {
        name: String(t.name ?? ''),
        description: String(t.description ?? ''),
        schemaProperties,
      };
    });

    return { tools };
  } catch (err) {
    return { tools: [], error: err instanceof Error ? err.message : String(err) };
  } finally {
    try { await client?.close(); } catch { /* ignore */ }
    try { await transport?.close(); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// Find bin entry
// ---------------------------------------------------------------------------

function findBinEntry(packageDir: string): { command: string; args: string[] } | null {
  const pjPath = join(packageDir, 'package.json');
  if (!existsSync(pjPath)) return null;

  try {
    const pj = JSON.parse(readFileSync(pjPath, 'utf-8'));

    // Check bin field
    if (pj.bin) {
      const binEntries = typeof pj.bin === 'string'
        ? { [pj.name ?? 'server']: pj.bin }
        : pj.bin as Record<string, string>;

      for (const [, binPath] of Object.entries(binEntries)) {
        const fullPath = join(packageDir, binPath);
        if (existsSync(fullPath)) {
          return { command: 'node', args: [fullPath] };
        }
      }
    }

    // Check main field
    if (pj.main) {
      const mainPath = join(packageDir, pj.main);
      if (existsSync(mainPath)) {
        return { command: 'node', args: [mainPath] };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Supply chain
// ---------------------------------------------------------------------------

const KNOWN_MCP = [
  'mcp-server-filesystem', 'mcp-server-github', 'mcp-server-postgres',
  'mcp-server-puppeteer', 'mcp-server-brave-search', 'mcp-server-fetch',
  'mcp-server-sqlite', 'mcp-server-gdrive', 'mcp-server-slack',
  'mcp-server-memory', 'mcp-server-everything', 'mcp-server-sequential-thinking',
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i]![j] = a[i-1] === b[j-1] ? dp[i-1]![j-1]! : 1 + Math.min(dp[i-1]![j]!, dp[i]![j-1]!, dp[i-1]![j-1]!);
  return dp[m]![n]!;
}

function checkSupplyChain(pkgName: string, packageDir: string) {
  const shortName = pkgName.split('/').pop()!;
  let typosquatRisk = false;
  let similarTo: string | undefined;
  for (const known of KNOWN_MCP) {
    if (shortName !== known && levenshtein(shortName, known) <= 2) {
      typosquatRisk = true;
      similarTo = known;
      break;
    }
  }

  let hasPostInstall = false;
  try {
    const pj = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'));
    hasPostInstall = !!(pj.scripts?.postinstall || pj.scripts?.preinstall);
  } catch { /* */ }

  return { typosquatRisk, similarTo, hasPostInstall };
}

// ---------------------------------------------------------------------------
// ATR Scan
// ---------------------------------------------------------------------------

async function scanTools(
  tools: DynamicTool[],
  engine: { evaluate: (e: Record<string, unknown>) => Array<Record<string, unknown>> },
) {
  const matches: DynamicAuditResult['atrMatches'] = [];
  const seen = new Set<string>();

  for (const tool of tools) {
    const results = engine.evaluate({
      type: 'mcp_exchange',
      source: 'mcp_tool',
      content: tool.description,
      timestamp: new Date().toISOString(),
      fields: { tool_name: tool.name, tool_args: tool.description },
    }) as Array<{ rule: { id: string; severity: string; title: string } }>;

    for (const r of results) {
      const key = `${r.rule.id}:${tool.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        ruleId: r.rule.id,
        severity: r.rule.severity,
        title: r.rule.title,
        toolName: tool.name,
      });
    }
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

function computeVerdict(
  tools: DynamicTool[],
  atrMatches: DynamicAuditResult['atrMatches'],
  supplyChain: { typosquatRisk: boolean; hasPostInstall: boolean; similarTo?: string },
) {
  const threats: string[] = [];
  let score = 0;

  if (supplyChain.typosquatRisk) {
    threats.push(`Typosquat: similar to "${supplyChain.similarTo}"`);
    score += 30;
  }
  if (supplyChain.hasPostInstall) {
    threats.push('postinstall script (auto-executes on npm install)');
    score += 15;
  }
  for (const m of atrMatches) {
    if (m.severity === 'critical') { threats.push(`${m.ruleId}: ${m.title} [${m.toolName}]`); score += 25; }
    else if (m.severity === 'high') { threats.push(`${m.ruleId}: ${m.title} [${m.toolName}]`); score += 15; }
  }

  // Check for dangerous tool patterns
  const dangerousTools = tools.filter(t =>
    /delete|remove|drop|execute|shell|admin|root/i.test(t.name + ' ' + t.description)
  );
  if (dangerousTools.length > 0 && tools.length > 0) {
    const ratio = dangerousTools.length / tools.length;
    if (ratio > 0.3) {
      threats.push(`${dangerousTools.length}/${tools.length} tools have destructive capabilities`);
      score += 10;
    }
  }

  score = Math.min(100, score);
  const riskLevel = score >= 70 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 15 ? 'MEDIUM' : score > 0 ? 'LOW' : 'CLEAN';
  return { riskScore: score, riskLevel, threats };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1]!, 10) : 20;
  const outputIdx = process.argv.indexOf('--output');
  const outputPath = outputIdx >= 0 ? resolve(process.argv[outputIdx + 1]!) : resolve('dynamic-audit.json');

  if (!existsSync('mcp-registry.json')) {
    console.error('Run crawl-mcp-registry.ts first'); process.exit(1);
  }
  const registry = JSON.parse(readFileSync('mcp-registry.json', 'utf-8'));
  const packages = registry.entries
    .filter((e: Record<string, unknown>) => e.npmPackage)
    .map((e: Record<string, unknown>) => ({ name: e.npmPackage as string, url: e.url as string }))
    .slice(0, limit);

  // Load ATR
  const { ATREngine } = await import('../dist/engine.js');
  const engine = new ATREngine({ rulesDir: resolve('rules') });
  await engine.loadRules();

  console.log(`\n  MCP Dynamic Auditor (Level 1: tools/list only)`);
  console.log(`  ATR rules: 52 | Packages: ${packages.length}`);
  console.log(`  Method: start MCP server → list tools → scan descriptions → shutdown`);
  console.log(`  Safety: NO tools are called. Read-only metadata request.\n`);

  const workDir = join(tmpdir(), 'atr-dynamic');
  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const results: DynamicAuditResult[] = [];

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

      // Install deps (needed for server to start)
      try {
        execSync(`cd "${packageDir}" && npm install --production --ignore-scripts 2>/dev/null`, {
          timeout: 60000, stdio: 'pipe',
        });
      } catch { /* some packages have no deps */ }

      // Version
      let version = '?';
      try {
        const pj = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'));
        version = pj.version ?? '?';
      } catch { /* */ }

      // Find entry point
      const bin = findBinEntry(packageDir);

      let connected = false;
      let connectionError: string | undefined;
      let tools: DynamicTool[] = [];

      if (bin) {
        const result = await listToolsFromServer(bin.command, bin.args, packageDir, 8_000);
        if (result.error) {
          connectionError = result.error;
        } else {
          connected = true;
          tools = result.tools;
        }
      } else {
        connectionError = 'No bin entry point found';
      }

      // Supply chain
      const supplyChain = checkSupplyChain(pkg.name, packageDir);

      // ATR scan on tool descriptions
      const atrMatches = connected ? await scanTools(tools, engine) : [];

      // Verdict
      const verdict = computeVerdict(tools, atrMatches, supplyChain);

      results.push({
        package: pkg.name, version, url: pkg.url,
        connected, connectionError,
        tools, toolCount: tools.length,
        atrMatches,
        ...supplyChain, ...verdict,
        auditedAt: new Date().toISOString(),
      });

    } catch (err) {
      results.push({
        package: pkg.name, version: '?', url: pkg.url,
        connected: false, connectionError: err instanceof Error ? err.message : String(err),
        tools: [], toolCount: 0, atrMatches: [],
        typosquatRisk: false, hasPostInstall: false,
        riskScore: -1, riskLevel: 'ERROR', threats: [],
        auditedAt: new Date().toISOString(),
      });
    }
  }

  process.stdout.write('\r'.padEnd(80) + '\r');
  try { rmSync(workDir, { recursive: true, force: true }); } catch { /* */ }

  // Summary
  const connected = results.filter(r => r.connected);
  const totalTools = connected.reduce((s, r) => s + r.toolCount, 0);
  const byLevel: Record<string, number> = {};
  for (const r of results) byLevel[r.riskLevel] = (byLevel[r.riskLevel] ?? 0) + 1;
  const flagged = results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');

  console.log('\n  ══════════════════════════════════════════════════════');
  console.log('  MCP DYNAMIC AUDIT — Level 1 (tools/list)');
  console.log('  ══════════════════════════════════════════════════════');
  console.log(`  Packages: ${results.length} | Connected: ${connected.length} | Tools found: ${totalTools}`);
  for (const [level, count] of Object.entries(byLevel).sort())
    console.log(`    ${level}: ${count}`);

  if (flagged.length > 0) {
    console.log('\n  FLAGGED:');
    for (const r of flagged) {
      console.log(`\n  [${r.riskLevel}] ${r.package} v${r.version} (score ${r.riskScore})`);
      console.log(`    Tools: ${r.tools.map(t => t.name).join(', ')}`);
      for (const t of r.threats) console.log(`    ! ${t}`);
    }
  }

  if (connected.length > 0) {
    console.log('\n  CONNECTED SERVERS:');
    for (const r of connected) {
      console.log(`    ${r.package} — ${r.toolCount} tools [${r.riskLevel}]`);
    }
  }

  writeFileSync(outputPath, JSON.stringify({
    auditedAt: new Date().toISOString(),
    total: results.length, connected: connected.length,
    totalTools, summary: byLevel, flagged: flagged.length, results,
  }, null, 2));
  console.log(`\n  Saved: ${outputPath}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
