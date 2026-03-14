#!/usr/bin/env npx tsx
/**
 * Audit npm MCP packages with ATR Skill Auditor
 *
 * Downloads top MCP packages from npm, extracts them,
 * scans with panguard skill auditor, and outputs findings.
 *
 * Usage:
 *   npx tsx scripts/audit-npm-skills.ts [--limit 20] [--output audit-results.json]
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

interface AuditResult {
  package: string;
  version: string;
  url: string;
  riskScore: number;
  riskLevel: string;
  findings: Array<{
    id: string;
    title: string;
    severity: string;
    category: string;
  }>;
  auditedAt: string;
  hasSkillMd: boolean;
  hasReadme: boolean;
  toolDescriptions: string[];
}

async function main() {
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1]!, 10) : 20;

  const outputIdx = process.argv.indexOf('--output');
  const outputPath = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('audit-results.json');

  // Load registry
  const registryPath = resolve('mcp-registry.json');
  if (!existsSync(registryPath)) {
    console.error('Run crawl-mcp-registry.ts first to generate mcp-registry.json');
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
  const npmPackages: Array<{ name: string; url: string }> = registry.entries
    .filter((e: Record<string, unknown>) => e.npmPackage)
    .map((e: Record<string, unknown>) => ({ name: e.npmPackage as string, url: e.url as string }))
    .slice(0, limit);

  // Load ATR engine
  const { ATREngine } = await import('../src/engine.js');
  const engine = new ATREngine({ rulesDir: resolve('rules') });
  const ruleCount = await engine.loadRules();

  console.log(`\n  MCP npm Package Auditor`);
  console.log(`  ATR engine loaded: ${ruleCount} rules`);
  console.log(`  Scanning ${npmPackages.length} packages\n`);

  const workDir = join(tmpdir(), 'atr-npm-audit');
  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const results: AuditResult[] = [];
  let idx = 0;

  for (const pkg of npmPackages) {
    idx++;
    const pct = Math.round((idx / npmPackages.length) * 100);
    process.stdout.write(`\r  [${pct}%] ${idx}/${npmPackages.length}: ${pkg.name}`.padEnd(80));

    const pkgDir = join(workDir, pkg.name.replace(/[/@]/g, '_'));

    try {
      // Download and extract package
      mkdirSync(pkgDir, { recursive: true });
      execSync(`npm pack ${pkg.name} --pack-destination "${pkgDir}" 2>/dev/null`, {
        timeout: 30000,
        stdio: 'pipe',
      });

      // Find the tarball
      const tarballs = readdirSync(pkgDir).filter(f => f.endsWith('.tgz'));
      if (tarballs.length === 0) {
        results.push({
          package: pkg.name, version: '?', url: pkg.url,
          riskScore: -1, riskLevel: 'ERROR', findings: [],
          auditedAt: new Date().toISOString(), hasSkillMd: false,
          hasReadme: false, toolDescriptions: [],
        });
        continue;
      }

      // Extract tarball
      const extractDir = join(pkgDir, 'extracted');
      mkdirSync(extractDir, { recursive: true });
      execSync(`tar xzf "${join(pkgDir, tarballs[0]!)}" -C "${extractDir}" 2>/dev/null`, {
        timeout: 10000,
        stdio: 'pipe',
      });

      // Find the package directory (usually ./package/)
      const packageDir = join(extractDir, 'package');
      if (!existsSync(packageDir)) continue;

      // Get version from package.json
      let version = '?';
      const pjPath = join(packageDir, 'package.json');
      if (existsSync(pjPath)) {
        try {
          const pj = JSON.parse(readFileSync(pjPath, 'utf-8'));
          version = pj.version ?? '?';
        } catch { /* ignore */ }
      }

      // Check for SKILL.md
      const hasSkillMd = existsSync(join(packageDir, 'SKILL.md'));
      const hasReadme = existsSync(join(packageDir, 'README.md'));

      // Extract tool descriptions from package content
      const toolDescriptions: string[] = [];
      try {
        const content = execSync(
          `grep -r "description" "${packageDir}" --include="*.json" --include="*.ts" --include="*.js" -l 2>/dev/null | head -5`,
          { timeout: 5000, stdio: 'pipe' }
        ).toString().trim();
        // Just note which files have descriptions
        if (content) {
          toolDescriptions.push(...content.split('\n').map(f => f.replace(packageDir + '/', '')));
        }
      } catch { /* ignore */ }

      // If has SKILL.md, run skill auditor
      let riskScore = 0;
      let riskLevel = 'NOT_SCANNED';
      let findings: AuditResult['findings'] = [];

      // Scan package content with ATR engine directly
      try {
        // Collect all text content from the package
        const textParts: string[] = [];

        if (hasReadme) {
          textParts.push(readFileSync(join(packageDir, 'README.md'), 'utf-8'));
        }
        if (hasSkillMd) {
          textParts.push(readFileSync(join(packageDir, 'SKILL.md'), 'utf-8'));
        }
        // Also scan package.json description and tool descriptions
        if (existsSync(pjPath)) {
          try {
            const pj = JSON.parse(readFileSync(pjPath, 'utf-8'));
            if (pj.description) textParts.push(pj.description);
            // Check for MCP tool definitions
            const distDir = join(packageDir, 'dist');
            if (existsSync(distDir)) {
              const jsFiles = readdirSync(distDir).filter(f => f.endsWith('.js')).slice(0, 5);
              for (const f of jsFiles) {
                try {
                  const content = readFileSync(join(distDir, f), 'utf-8').slice(0, 10000);
                  textParts.push(content);
                } catch { /* skip */ }
              }
            }
          } catch { /* skip */ }
        }

        const fullText = textParts.join('\n');
        if (fullText.length > 0 && engine) {
          // Scan as multiple event types
          const events = [
            { type: 'llm_input' as const, content: fullText, fields: { user_input: fullText } },
            { type: 'tool_call' as const, content: fullText, fields: { tool_args: fullText, tool_name: pkg.name } },
            { type: 'mcp_exchange' as const, content: fullText, fields: {} },
          ];

          const allMatches = new Map<string, { id: string; title: string; severity: string; category: string }>();
          for (const evt of events) {
            const matches = engine.evaluate({
              type: evt.type,
              source: 'mcp_tool',
              content: evt.content.slice(0, 50000), // limit size
              timestamp: new Date().toISOString(),
              fields: evt.fields,
            });
            for (const m of matches) {
              if (!allMatches.has(m.rule.id)) {
                allMatches.set(m.rule.id, {
                  id: m.rule.id,
                  title: m.rule.title,
                  severity: m.rule.severity,
                  category: m.rule.tags?.category ?? 'unknown',
                });
              }
            }
          }

          findings = [...allMatches.values()];

          // Calculate risk score
          const sevWeights: Record<string, number> = { critical: 25, high: 15, medium: 5, low: 1 };
          riskScore = Math.min(100, findings.reduce((sum, f) => sum + (sevWeights[f.severity] ?? 0), 0));
          riskLevel = riskScore >= 70 ? 'CRITICAL' :
                      riskScore >= 40 ? 'HIGH' :
                      riskScore >= 15 ? 'MEDIUM' :
                      riskScore > 0  ? 'LOW' : 'CLEAN';
        } else {
          riskLevel = 'NO_CONTENT';
        }
      } catch {
        riskLevel = 'AUDIT_ERROR';
      }

      results.push({
        package: pkg.name,
        version,
        url: pkg.url,
        riskScore,
        riskLevel,
        findings,
        auditedAt: new Date().toISOString(),
        hasSkillMd,
        hasReadme,
        toolDescriptions,
      });
    } catch (err) {
      results.push({
        package: pkg.name, version: '?', url: pkg.url,
        riskScore: -1, riskLevel: 'DOWNLOAD_ERROR',
        findings: [],
        auditedAt: new Date().toISOString(),
        hasSkillMd: false, hasReadme: false, toolDescriptions: [],
      });
    }
  }

  process.stdout.write('\r'.padEnd(80) + '\r');

  // Clean up
  try { rmSync(workDir, { recursive: true, force: true }); } catch { /* ignore */ }

  // Summary
  const byLevel: Record<string, number> = {};
  for (const r of results) {
    byLevel[r.riskLevel] = (byLevel[r.riskLevel] ?? 0) + 1;
  }

  console.log('\n  ══════════════════════════════════════');
  console.log('  MCP npm AUDIT RESULTS');
  console.log('  ══════════════════════════════════════');
  console.log(`  Total scanned: ${results.length}`);
  for (const [level, count] of Object.entries(byLevel).sort()) {
    console.log(`    ${level}: ${count}`);
  }

  // Show CRITICAL and HIGH
  const flagged = results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');
  if (flagged.length > 0) {
    console.log('\n  FLAGGED:');
    for (const r of flagged) {
      console.log(`    [${r.riskLevel}] ${r.package} v${r.version} — score ${r.riskScore}`);
      for (const f of r.findings.filter(f => f.severity === 'critical' || f.severity === 'high')) {
        console.log(`      - [${f.severity.toUpperCase()}] ${f.title}`);
      }
    }
  }

  // Save
  const output = {
    auditedAt: new Date().toISOString(),
    totalScanned: results.length,
    summary: byLevel,
    flagged: flagged.length,
    results,
  };
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n  Saved to: ${outputPath}\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
