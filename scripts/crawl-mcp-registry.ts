#!/usr/bin/env npx tsx
/**
 * MCP Skill Registry Crawler
 *
 * Crawls multiple sources to build a comprehensive catalog of MCP servers/skills:
 *   1. GitHub API — search for MCP server repositories
 *   2. npm registry — search for MCP-related packages
 *   3. awesome-mcp-servers — curated community lists
 *
 * Outputs: mcp-registry.json (unified catalog for batch auditing)
 *
 * Usage:
 *   npx tsx scripts/crawl-mcp-registry.ts [--output <path>] [--limit <n>]
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MCPEntry {
  name: string;
  source: 'github' | 'npm' | 'awesome-list' | 'mcp.so' | 'smithery';
  url: string;
  description: string;
  stars?: number;
  language?: string;
  lastUpdated?: string;
  npmPackage?: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// GitHub API
// ---------------------------------------------------------------------------

async function crawlGitHub(limit: number): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const queries = [
    'mcp+server in:name,description language:TypeScript',
    'mcp+server in:name,description language:Python',
    'model+context+protocol+server in:name,description',
    '@modelcontextprotocol in:readme',
  ];

  for (const q of queries) {
    const perPage = Math.min(100, limit - entries.length);
    if (perPage <= 0) break;

    try {
      const resp = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=${perPage}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            ...(process.env['GITHUB_TOKEN']
              ? { Authorization: `Bearer ${process.env['GITHUB_TOKEN']}` }
              : {}),
          },
        }
      );

      if (!resp.ok) {
        console.error(`  GitHub API error: ${resp.status} for query "${q}"`);
        continue;
      }

      const data = (await resp.json()) as { items: Array<Record<string, unknown>> };
      for (const repo of data.items ?? []) {
        const fullName = repo['full_name'] as string;
        if (entries.some((e) => e.url.includes(fullName))) continue; // dedup

        entries.push({
          name: repo['name'] as string,
          source: 'github',
          url: repo['html_url'] as string,
          description: ((repo['description'] as string) ?? '').slice(0, 200),
          stars: repo['stargazers_count'] as number,
          language: (repo['language'] as string) ?? undefined,
          lastUpdated: (repo['updated_at'] as string) ?? undefined,
        });
      }

      // Rate limit: 10 requests per minute for unauthenticated
      await sleep(1500);
    } catch (err) {
      console.error(`  GitHub crawl error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// npm Registry
// ---------------------------------------------------------------------------

async function crawlNpm(npmLimit: number = 10000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();
  const queries = [
    'mcp-server', 'mcp', '@modelcontextprotocol', 'model-context-protocol',
    'mcp-tool', 'mcp-plugin', 'claude-mcp', 'ai-mcp',
  ];
  const pageSize = 250;

  for (const q of queries) {
    if (entries.length >= npmLimit) break;
    let from = 0;
    let hasMore = true;

    while (hasMore && entries.length < npmLimit) {
      try {
        const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=${pageSize}&from=${from}`;
        const resp = await fetch(url);
        if (!resp.ok) { hasMore = false; continue; }

        const data = (await resp.json()) as {
          total: number;
          objects: Array<{ package: Record<string, unknown> }>;
        };
        const objects = data.objects ?? [];
        if (objects.length === 0) { hasMore = false; continue; }

        for (const obj of objects) {
          const pkg = obj.package;
          const name = pkg['name'] as string;
          if (seen.has(name)) continue;
          seen.add(name);

          entries.push({
            name,
            source: 'npm',
            url: `https://www.npmjs.com/package/${name}`,
            description: ((pkg['description'] as string) ?? '').slice(0, 200),
            npmPackage: name,
            lastUpdated: (pkg['date'] as string) ?? undefined,
          });
        }

        from += pageSize;
        // npm search relevance drops after ~2000 results per query
        if (from >= 2000 || objects.length < pageSize) {
          hasMore = false;
        }

        console.log(`    [npm] q="${q}" from=${from} entries=${entries.length}/${data.total}`);
        await sleep(300);
      } catch (err) {
        console.error(`  npm crawl error: ${err instanceof Error ? err.message : String(err)}`);
        hasMore = false;
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Awesome Lists (pre-parsed)
// ---------------------------------------------------------------------------

async function crawlAwesomeLists(): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const lists = [
    'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md',
    'https://raw.githubusercontent.com/appcypher/awesome-mcp-servers/main/README.md',
  ];

  for (const url of lists) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const text = await resp.text();

      // Extract GitHub URLs from markdown links
      const linkRegex = /\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(text)) !== null) {
        const name = match[1]!;
        const repoUrl = match[2]!;
        if (entries.some((e) => e.url === repoUrl)) continue;

        // Get description: text after the link until next newline or pipe
        const afterLink = text.slice(match.index + match[0].length, match.index + match[0].length + 300);
        const descMatch = afterLink.match(/[-–—]\s*"?([^"\n|]+)"?/);
        const description = descMatch ? descMatch[1]!.trim().slice(0, 200) : '';

        entries.push({
          name: name.replace(/[*_`]/g, '').trim(),
          source: 'awesome-list',
          url: repoUrl,
          description,
        });
      }
    } catch (err) {
      console.error(`  Awesome list crawl error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Deduplication & Enrichment
// ---------------------------------------------------------------------------

function deduplicateEntries(entries: MCPEntry[]): MCPEntry[] {
  const seen = new Map<string, MCPEntry>();

  for (const entry of entries) {
    // Normalize URL for dedup
    const key = entry.url
      .replace(/https?:\/\//, '')
      .replace(/\.git$/, '')
      .replace(/\/$/, '')
      .toLowerCase();

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, entry);
    } else {
      // Merge: keep entry with most data
      if (!existing.stars && entry.stars) existing.stars = entry.stars;
      if (!existing.language && entry.language) existing.language = entry.language;
      if (!existing.npmPackage && entry.npmPackage) existing.npmPackage = entry.npmPackage;
      if (!existing.description && entry.description) existing.description = entry.description;
    }
  }

  return [...seen.values()];
}

function categorize(entry: MCPEntry): string {
  const text = `${entry.name} ${entry.description}`.toLowerCase();

  if (text.match(/security|audit|scan|vuln|guard|firewall|auth/)) return 'security';
  if (text.match(/database|sql|postgres|mysql|mongo|redis|sqlite|supabase/)) return 'database';
  if (text.match(/browser|puppeteer|playwright|scrape|crawl/)) return 'browser-automation';
  if (text.match(/kubernetes|k8s|docker|cloud|aws|azure|gcp/)) return 'cloud-infra';
  if (text.match(/slack|discord|telegram|email|whatsapp|message/)) return 'communication';
  if (text.match(/git|github|gitlab|code|ide|vscode/)) return 'development';
  if (text.match(/search|web|fetch|api/)) return 'search-web';
  if (text.match(/file|filesystem|storage|drive/)) return 'file-system';
  if (text.match(/ai|llm|openai|claude|gemini|model/)) return 'ai-service';
  if (text.match(/finance|payment|stripe|crypto|trade/)) return 'finance';
  if (text.match(/note|obsidian|notion|todo/)) return 'productivity';
  return 'other';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1]!, 10) : 500;

  const outputIdx = process.argv.indexOf('--output');
  const outputPath = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('mcp-registry.json');

  console.log('\n  MCP Registry Crawler');
  console.log(`  Limit: ${limit} repos per source\n`);

  // Crawl all sources
  console.log('  [1/3] Crawling GitHub...');
  const github = await crawlGitHub(limit);
  console.log(`    Found ${github.length} repos`);

  console.log('  [2/3] Crawling npm (with pagination)...');
  const npm = await crawlNpm(10000);
  console.log(`    Found ${npm.length} packages`);

  console.log('  [3/3] Crawling awesome lists...');
  const awesome = await crawlAwesomeLists();
  console.log(`    Found ${awesome.length} entries`);

  // Merge & deduplicate
  const all = [...github, ...npm, ...awesome];
  console.log(`\n  Total before dedup: ${all.length}`);

  const deduped = deduplicateEntries(all);
  console.log(`  Total after dedup: ${deduped.length}`);

  // Categorize
  for (const entry of deduped) {
    entry.category = categorize(entry);
  }

  // Sort by stars (descending), then name
  deduped.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.name.localeCompare(b.name));

  // Summary
  const byCategory = new Map<string, number>();
  const bySource = new Map<string, number>();
  for (const e of deduped) {
    byCategory.set(e.category!, (byCategory.get(e.category!) ?? 0) + 1);
    bySource.set(e.source, (bySource.get(e.source) ?? 0) + 1);
  }

  console.log('\n  By source:');
  for (const [src, count] of bySource) console.log(`    ${src}: ${count}`);
  console.log('\n  By category:');
  for (const [cat, count] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`);
  }

  // Save
  const output = {
    crawledAt: new Date().toISOString(),
    totalEntries: deduped.length,
    sources: Object.fromEntries(bySource),
    categories: Object.fromEntries(byCategory),
    entries: deduped,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n  Saved to: ${outputPath}`);
  console.log(`  Total entries: ${deduped.length}\n`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
