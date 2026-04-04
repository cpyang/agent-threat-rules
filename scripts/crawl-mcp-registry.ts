#!/usr/bin/env npx tsx
/**
 * MCP Skill Registry Crawler — Multi-Source Edition
 *
 * Crawls all known MCP marketplaces to build a comprehensive catalog:
 *   1. GitHub API — search for MCP server repositories
 *   2. npm registry — search for MCP-related packages
 *   3. awesome-mcp-servers — curated community lists
 *   4. Glama — glama.ai/mcp/servers (20K+ servers)
 *   5. PulseMCP — pulsemcp.com (12K+ servers)
 *   6. Smithery — smithery.ai registry
 *   7. mcp.so — MCP server directory
 *   8. MCP Hub — mcphub.io community listing
 *
 * Outputs: mcp-registry.json (unified catalog for batch auditing)
 *
 * Usage:
 *   npx tsx scripts/crawl-mcp-registry.ts [options]
 *
 * Options:
 *   --output <path>    Output file (default: mcp-registry.json)
 *   --limit <n>        Limit per source (default: 500)
 *   --sources <list>   Comma-separated sources to crawl (default: all)
 *                      Values: github,npm,awesome,glama,pulsemcp,smithery,mcpso,mcphub
 *   --merge <path>     Merge with existing registry file
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SourceType =
  | 'github'
  | 'npm'
  | 'awesome-list'
  | 'glama'
  | 'pulsemcp'
  | 'smithery'
  | 'mcp.so'
  | 'mcphub';

interface MCPEntry {
  name: string;
  source: SourceType;
  sources?: SourceType[]; // tracks all sources after dedup merge
  url: string;
  description: string;
  stars?: number;
  language?: string;
  lastUpdated?: string;
  npmPackage?: string;
  category?: string;
  installCount?: number;
  tags?: string[];
  runtime?: 'node' | 'python' | 'wasm' | 'docker';
}

interface CrawlState {
  [sourceKey: string]: {
    lastCrawled: string;
    totalFetched: number;
    errors: number;
  };
}

interface RegistryOutput {
  crawledAt: string;
  totalEntries: number;
  sources: Record<string, number>;
  categories: Record<string, number>;
  entries: MCPEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'ATR-Scanner/0.4.0 (https://github.com/Agent-Threat-Rule/agent-threat-rules)',
          ...options.headers,
        },
      });
      if (resp.status === 429) {
        const retryAfter = parseInt(resp.headers.get('retry-after') ?? '5', 10);
        console.error(`    Rate limited, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }
      return resp;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.error(`    Retry ${i + 1}/${retries}: ${err instanceof Error ? err.message : String(err)}`);
      await sleep(delayMs * (i + 1));
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

// ---------------------------------------------------------------------------
// Source: GitHub API
// ---------------------------------------------------------------------------

async function crawlGitHub(limit: number): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const queries = [
    'mcp+server in:name,description language:TypeScript',
    'mcp+server in:name,description language:Python',
    'model+context+protocol+server in:name,description',
    '@modelcontextprotocol in:readme',
    'mcp-tool in:name,description',
    'fastmcp in:name,description language:Python',
  ];

  for (const q of queries) {
    const perPage = Math.min(100, limit - entries.length);
    if (perPage <= 0) break;

    try {
      const resp = await fetchWithRetry(
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
        console.error(`    GitHub API error: ${resp.status} for query "${q}"`);
        continue;
      }

      const data = (await resp.json()) as { items: Array<Record<string, unknown>> };
      for (const repo of data.items ?? []) {
        const fullName = repo['full_name'] as string;
        if (entries.some((e) => e.url.includes(fullName))) continue;

        const lang = (repo['language'] as string) ?? undefined;
        entries.push({
          name: repo['name'] as string,
          source: 'github',
          url: repo['html_url'] as string,
          description: ((repo['description'] as string) ?? '').slice(0, 200),
          stars: repo['stargazers_count'] as number,
          language: lang,
          lastUpdated: (repo['updated_at'] as string) ?? undefined,
          runtime: lang === 'Python' ? 'python' : lang === 'TypeScript' || lang === 'JavaScript' ? 'node' : undefined,
        });
      }

      await sleep(1500);
    } catch (err) {
      console.error(`    GitHub crawl error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: npm Registry
// ---------------------------------------------------------------------------

async function crawlNpm(npmLimit: number = 10000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();
  const queries = [
    'mcp-server', 'mcp', '@modelcontextprotocol', 'model-context-protocol',
    'mcp-tool', 'mcp-plugin', 'claude-mcp', 'ai-mcp',
    'mcp-client', 'fastmcp', 'mcp-framework',
  ];
  const pageSize = 250;

  for (const q of queries) {
    if (entries.length >= npmLimit) break;
    let from = 0;
    let hasMore = true;

    while (hasMore && entries.length < npmLimit) {
      try {
        const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=${pageSize}&from=${from}`;
        const resp = await fetchWithRetry(url);
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
            runtime: 'node',
          });
        }

        from += pageSize;
        if (from >= 2000 || objects.length < pageSize) {
          hasMore = false;
        }

        console.log(`    [npm] q="${q}" from=${from} entries=${entries.length}/${data.total}`);
        await sleep(300);
      } catch (err) {
        console.error(`    npm crawl error: ${err instanceof Error ? err.message : String(err)}`);
        hasMore = false;
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: Awesome Lists
// ---------------------------------------------------------------------------

async function crawlAwesomeLists(): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const lists = [
    'https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md',
    'https://raw.githubusercontent.com/appcypher/awesome-mcp-servers/main/README.md',
  ];

  for (const url of lists) {
    try {
      const resp = await fetchWithRetry(url);
      if (!resp.ok) continue;
      const text = await resp.text();

      const linkRegex = /\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(text)) !== null) {
        const name = match[1]!;
        const repoUrl = match[2]!;
        if (entries.some((e) => e.url === repoUrl)) continue;

        const afterLink = text.slice(match.index + match[0].length, match.index + match[0].length + 300);
        const descMatch = afterLink.match(/[-\u2013\u2014]\s*"?([^"\n|]+)"?/);
        const description = descMatch ? descMatch[1]!.trim().slice(0, 200) : '';

        entries.push({
          name: name.replace(/[*_`]/g, '').trim(),
          source: 'awesome-list',
          url: repoUrl,
          description,
        });
      }
    } catch (err) {
      console.error(`    Awesome list crawl error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: Glama (glama.ai/mcp/servers) — 20K+ servers
// ---------------------------------------------------------------------------

async function crawlGlama(limit: number = 25000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  // Strategy: Use sitemap (most reliable) then fall back to HTML scraping
  console.log('    [glama] Fetching sitemap...');

  try {
    const sitemapResp = await fetchWithRetry('https://glama.ai/sitemaps/mcp-servers.xml');
    if (sitemapResp.ok) {
      const xml = await sitemapResp.text();
      // Extract URLs from sitemap: <loc>https://glama.ai/mcp/servers/{author}/{server}</loc>
      const locRegex = /<loc>(https:\/\/glama\.ai\/mcp\/servers\/([^<]+))<\/loc>/g;
      let match: RegExpExecArray | null;

      while ((match = locRegex.exec(xml)) !== null && entries.length < limit) {
        const serverUrl = match[1]!;
        const slug = match[2]!;
        // Only take {author}/{server}, skip deeper paths
        const parts = slug.split('/');
        if (parts.length !== 2) continue;
        if (seen.has(slug)) continue;
        seen.add(slug);

        entries.push({
          name: parts[1]!,
          source: 'glama',
          url: serverUrl,
          description: '',
        });
      }

      console.log(`    [glama] Sitemap: found ${entries.length} servers`);
    }
  } catch (err) {
    console.error(`    Glama sitemap error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Also try the tools sitemap for additional coverage
  try {
    const toolsSitemapResp = await fetchWithRetry('https://glama.ai/sitemaps/mcp-tools.xml');
    if (toolsSitemapResp.ok) {
      const xml = await toolsSitemapResp.text();
      // Extract server names from tool URLs: /mcp/servers/{author}/{server}/tools/{tool}
      const locRegex = /<loc>https:\/\/glama\.ai\/mcp\/servers\/([^/]+\/[^/]+)\/tools\//g;
      let match: RegExpExecArray | null;

      while ((match = locRegex.exec(xml)) !== null && entries.length < limit) {
        const slug = match[1]!;
        if (seen.has(slug)) continue;
        seen.add(slug);

        const parts = slug.split('/');
        entries.push({
          name: parts[1]!,
          source: 'glama',
          url: `https://glama.ai/mcp/servers/${slug}`,
          description: '',
        });
      }

      console.log(`    [glama] Tools sitemap: total now ${entries.length} servers`);
    }
  } catch (err) {
    console.error(`    Glama tools sitemap error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: PulseMCP (pulsemcp.com/servers) — 12K+ servers
// ---------------------------------------------------------------------------

async function crawlPulseMCP(limit: number = 15000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  // Strategy 1: Try sitemap first
  console.log('    [pulsemcp] Fetching sitemap...');
  try {
    const sitemapResp = await fetchWithRetry('https://pulsemcp.com/sitemap.xml');
    if (sitemapResp.ok) {
      const xml = await sitemapResp.text();
      // Extract server URLs: /servers/{slug} (not paginated search results)
      const locRegex = /<loc>https:\/\/pulsemcp\.com\/servers\/([a-zA-Z0-9_-]+[^<]*)<\/loc>/g;
      let match: RegExpExecArray | null;

      while ((match = locRegex.exec(xml)) !== null && entries.length < limit) {
        const slug = match[1]!;
        // Skip pagination/search URLs
        if (slug.includes('?') || slug.includes('page=')) continue;
        if (seen.has(slug)) continue;
        seen.add(slug);

        const displayName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        entries.push({
          name: displayName,
          source: 'pulsemcp',
          url: `https://pulsemcp.com/servers/${slug}`,
          description: '',
        });
      }

      console.log(`    [pulsemcp] Sitemap: found ${entries.length} servers`);
    }
  } catch (err) {
    console.error(`    PulseMCP sitemap error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Strategy 2: If sitemap didn't yield individual server pages, scrape paginated listing
  if (entries.length < 100) {
    console.log('    [pulsemcp] Sitemap had few individual pages, scraping listings...');
    let page = 1;
    let hasMore = true;
    const maxPages = Math.ceil(limit / 42);

    while (hasMore && page <= maxPages && entries.length < limit) {
      try {
        const url = `https://pulsemcp.com/servers?page=${page}`;
        const resp = await fetchWithRetry(url, {
          headers: { Accept: 'text/html,application/xhtml+xml' },
        });

        if (!resp.ok) { hasMore = false; continue; }

        const html = await resp.text();
        let foundOnPage = 0;

        // Extract server links
        const cardRegex = /href="\/servers\/([a-zA-Z0-9_-]+)"[^>]*>/g;
        let cardMatch: RegExpExecArray | null;

        while ((cardMatch = cardRegex.exec(html)) !== null) {
          const slug = cardMatch[1]!;
          if (seen.has(slug) || slug.length < 2) continue;
          seen.add(slug);

          const displayName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          entries.push({
            name: displayName,
            source: 'pulsemcp',
            url: `https://pulsemcp.com/servers/${slug}`,
            description: '',
          });
          foundOnPage++;
        }

        console.log(`    [pulsemcp] page=${page} found=${foundOnPage} total=${entries.length}`);

        if (foundOnPage === 0) hasMore = false;
        else { page++; await sleep(800); }
      } catch (err) {
        console.error(`    PulseMCP crawl error: ${err instanceof Error ? err.message : String(err)}`);
        hasMore = false;
      }
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: Smithery (smithery.ai)
// ---------------------------------------------------------------------------

async function crawlSmithery(limit: number = 5000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  // Try the API endpoint first
  let page = 1;
  let hasMore = true;

  while (hasMore && entries.length < limit) {
    try {
      // Smithery may have a paginated API
      const url = `https://smithery.ai/api/servers?page=${page}&pageSize=100`;
      const resp = await fetchWithRetry(url);

      if (resp.status === 429) {
        console.error(`    Smithery rate limited at page ${page}, stopping.`);
        hasMore = false;
        continue;
      }

      if (!resp.ok) {
        // Fallback: try HTML scraping
        if (page === 1) {
          console.log(`    Smithery API returned ${resp.status}, trying HTML...`);
          const htmlEntries = await crawlSmitheryHTML(limit);
          return htmlEntries;
        }
        hasMore = false;
        continue;
      }

      const data = (await resp.json()) as {
        servers?: Array<Record<string, unknown>>;
        data?: Array<Record<string, unknown>>;
        total?: number;
        items?: Array<Record<string, unknown>>;
      };

      const servers = data.servers ?? data.data ?? data.items ?? [];
      if (servers.length === 0) { hasMore = false; continue; }

      for (const server of servers) {
        const name = (server['name'] as string) ?? (server['qualifiedName'] as string) ?? '';
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        const repoUrl = (server['repository'] as string) ??
          (server['githubUrl'] as string) ??
          (server['url'] as string) ??
          `https://smithery.ai/server/${name}`;

        entries.push({
          name,
          source: 'smithery',
          url: repoUrl,
          description: ((server['description'] as string) ?? '').slice(0, 200),
          stars: (server['stars'] as number) ?? (server['githubStars'] as number) ?? undefined,
          installCount: (server['downloads'] as number) ?? (server['installCount'] as number) ?? undefined,
        });
      }

      console.log(`    [smithery] page=${page} found=${servers.length} total=${entries.length}`);
      page++;
      await sleep(1500);
    } catch (err) {
      console.error(`    Smithery crawl error: ${err instanceof Error ? err.message : String(err)}`);
      hasMore = false;
    }
  }

  return entries;
}

async function crawlSmitheryHTML(limit: number): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  try {
    const resp = await fetchWithRetry('https://smithery.ai/explore', {
      headers: { Accept: 'text/html' },
    });
    if (!resp.ok) return entries;

    const html = await resp.text();

    // Extract __NEXT_DATA__ or server links
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]!);
        const props = nextData?.props?.pageProps ?? {};
        const servers = props.servers ?? props.data ?? [];
        for (const server of servers) {
          const name = (server.name ?? server.qualifiedName ?? '') as string;
          if (!name || seen.has(name.toLowerCase())) continue;
          seen.add(name.toLowerCase());

          entries.push({
            name,
            source: 'smithery',
            url: (server.repository ?? server.url ?? `https://smithery.ai/server/${name}`) as string,
            description: ((server.description ?? '') as string).slice(0, 200),
            stars: server.stars as number | undefined,
            installCount: server.downloads as number | undefined,
          });
        }
      } catch {
        // skip
      }
    }

    // Fallback: extract server links
    if (entries.length === 0) {
      const linkRegex = /href="\/server\/([^"]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(html)) !== null) {
        const slug = match[1]!;
        if (seen.has(slug)) continue;
        seen.add(slug);

        entries.push({
          name: slug,
          source: 'smithery',
          url: `https://smithery.ai/server/${slug}`,
          description: '',
        });
      }
    }

    console.log(`    [smithery-html] found=${entries.length}`);
  } catch (err) {
    console.error(`    Smithery HTML crawl error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Source: mcp.so
// ---------------------------------------------------------------------------

async function crawlMcpSo(limit: number = 5000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  try {
    // Try direct page fetch
    const resp = await fetchWithRetry('https://mcp.so/servers', {
      headers: { Accept: 'text/html' },
    });

    if (!resp.ok) {
      console.error(`    mcp.so returned ${resp.status}, trying alternative URLs...`);

      // Try alternative endpoints
      for (const altUrl of ['https://mcp.so/api/servers', 'https://mcp.so/', 'https://mcp.so/explore']) {
        try {
          const altResp = await fetchWithRetry(altUrl, {
            headers: { Accept: 'text/html,application/json' },
          });
          if (altResp.ok) {
            const contentType = altResp.headers.get('content-type') ?? '';
            if (contentType.includes('json')) {
              const data = await altResp.json() as Array<Record<string, unknown>>;
              for (const server of (Array.isArray(data) ? data : [])) {
                const name = (server['name'] as string) ?? '';
                if (!name || seen.has(name.toLowerCase())) continue;
                seen.add(name.toLowerCase());
                entries.push({
                  name,
                  source: 'mcp.so',
                  url: (server['url'] as string) ?? `https://mcp.so/server/${name}`,
                  description: ((server['description'] as string) ?? '').slice(0, 200),
                });
              }
            } else {
              const html = await altResp.text();
              // Extract from __NEXT_DATA__ or links
              const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
              if (nextDataMatch) {
                try {
                  const nextData = JSON.parse(nextDataMatch[1]!);
                  const servers = nextData?.props?.pageProps?.servers ?? nextData?.props?.pageProps?.data ?? [];
                  for (const server of servers) {
                    const sName = (server.name ?? '') as string;
                    if (!sName || seen.has(sName.toLowerCase())) continue;
                    seen.add(sName.toLowerCase());
                    entries.push({
                      name: sName,
                      source: 'mcp.so',
                      url: (server.url ?? `https://mcp.so/server/${sName}`) as string,
                      description: ((server.description ?? '') as string).slice(0, 200),
                    });
                  }
                } catch {
                  // skip
                }
              }

              // Fallback: extract server links
              const linkRegex = /href="\/server[s]?\/([^"]+)"/g;
              let match: RegExpExecArray | null;
              while ((match = linkRegex.exec(html)) !== null) {
                const slug = match[1]!;
                if (seen.has(slug) || slug.includes('?')) continue;
                seen.add(slug);
                entries.push({
                  name: slug.replace(/-/g, ' '),
                  source: 'mcp.so',
                  url: `https://mcp.so/server/${slug}`,
                  description: '',
                });
              }
            }
            break;
          }
        } catch {
          continue;
        }
      }
    } else {
      const html = await resp.text();
      const linkRegex = /href="\/server[s]?\/([^"]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(html)) !== null) {
        const slug = match[1]!;
        if (seen.has(slug) || slug.includes('?')) continue;
        seen.add(slug);
        entries.push({
          name: slug.replace(/-/g, ' '),
          source: 'mcp.so',
          url: `https://mcp.so/server/${slug}`,
          description: '',
        });
      }
    }
  } catch (err) {
    console.error(`    mcp.so crawl error: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log(`    [mcp.so] found=${entries.length}`);
  return entries;
}

// ---------------------------------------------------------------------------
// Source: MCP Hub (mcphub.io)
// ---------------------------------------------------------------------------

async function crawlMcpHub(limit: number = 5000): Promise<MCPEntry[]> {
  const entries: MCPEntry[] = [];
  const seen = new Set<string>();

  try {
    // Try API endpoints
    for (const url of [
      'https://mcphub.io/api/servers',
      'https://mcphub.io/api/mcp-servers',
      'https://mcphub.io/',
    ]) {
      try {
        const resp = await fetchWithRetry(url, {
          headers: { Accept: 'text/html,application/json' },
        });

        if (!resp.ok) continue;

        const contentType = resp.headers.get('content-type') ?? '';
        if (contentType.includes('json')) {
          const data = await resp.json() as Record<string, unknown>;
          const servers = (data['servers'] ?? data['data'] ?? data['items'] ?? []) as Array<Record<string, unknown>>;
          for (const server of servers) {
            const name = (server['name'] as string) ?? '';
            if (!name || seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());
            entries.push({
              name,
              source: 'mcphub',
              url: (server['url'] as string) ?? `https://mcphub.io/server/${name}`,
              description: ((server['description'] as string) ?? '').slice(0, 200),
            });
          }
        } else {
          const html = await resp.text();
          // Extract __NEXT_DATA__
          const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
          if (nextDataMatch) {
            try {
              const nextData = JSON.parse(nextDataMatch[1]!);
              const servers = nextData?.props?.pageProps?.servers ?? nextData?.props?.pageProps?.data ?? [];
              for (const server of servers) {
                const sName = (server.name ?? '') as string;
                if (!sName || seen.has(sName.toLowerCase())) continue;
                seen.add(sName.toLowerCase());
                entries.push({
                  name: sName,
                  source: 'mcphub',
                  url: (server.url ?? `https://mcphub.io/server/${sName}`) as string,
                  description: ((server.description ?? '') as string).slice(0, 200),
                });
              }
            } catch {
              // skip
            }
          }

          // Fallback: extract server links
          const linkRegex = /href="\/(?:server|mcp)[s]?\/([^"]+)"/g;
          let match: RegExpExecArray | null;
          while ((match = linkRegex.exec(html)) !== null) {
            const slug = match[1]!;
            if (seen.has(slug) || slug.includes('?') || slug.length < 2) continue;
            seen.add(slug);
            entries.push({
              name: slug.replace(/-/g, ' '),
              source: 'mcphub',
              url: `https://mcphub.io/server/${slug}`,
              description: '',
            });
          }
        }

        if (entries.length > 0) break; // got data from one endpoint
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error(`    MCP Hub crawl error: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log(`    [mcphub] found=${entries.length}`);
  return entries;
}

// ---------------------------------------------------------------------------
// Deduplication & Enrichment
// ---------------------------------------------------------------------------

function normalizeUrl(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
    .replace(/^www\./, '')
    .toLowerCase();
}

function deduplicateEntries(entries: MCPEntry[]): MCPEntry[] {
  const byUrl = new Map<string, MCPEntry>();
  const byName = new Map<string, MCPEntry>();

  for (const entry of entries) {
    const urlKey = normalizeUrl(entry.url);
    const nameKey = entry.npmPackage?.toLowerCase() ?? entry.name.toLowerCase();

    const existingByUrl = byUrl.get(urlKey);
    const existingByName = byName.get(nameKey);
    const existing = existingByUrl ?? existingByName;

    if (!existing) {
      const merged = { ...entry, sources: [entry.source] };
      byUrl.set(urlKey, merged);
      byName.set(nameKey, merged);
    } else {
      // Merge: keep richest data, track all sources
      if (!existing.sources) existing.sources = [existing.source];
      if (!existing.sources.includes(entry.source)) {
        existing.sources.push(entry.source);
      }
      if (!existing.stars && entry.stars) existing.stars = entry.stars;
      if (!existing.language && entry.language) existing.language = entry.language;
      if (!existing.npmPackage && entry.npmPackage) existing.npmPackage = entry.npmPackage;
      if (!existing.description && entry.description) existing.description = entry.description;
      if (!existing.installCount && entry.installCount) existing.installCount = entry.installCount;
      if (!existing.tags && entry.tags) existing.tags = entry.tags;
      if (!existing.runtime && entry.runtime) existing.runtime = entry.runtime;

      // Update maps so both keys point to same merged entry
      byUrl.set(urlKey, existing);
      byName.set(nameKey, existing);
    }
  }

  // Deduplicate the values (since multiple keys may point to same entry)
  const uniqueEntries = new Set(byUrl.values());
  return [...uniqueEntries];
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
// Crawl State Management
// ---------------------------------------------------------------------------

function loadCrawlState(stateFile: string): CrawlState {
  if (existsSync(stateFile)) {
    return JSON.parse(readFileSync(stateFile, 'utf-8')) as CrawlState;
  }
  return {};
}

function saveCrawlState(stateFile: string, state: CrawlState): void {
  writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ALL_SOURCES = ['github', 'npm', 'awesome', 'glama', 'pulsemcp', 'smithery', 'mcpso', 'mcphub'] as const;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const limit = parseInt(getArg('--limit') ?? '500', 10);
  const outputPath = resolve(getArg('--output') ?? 'mcp-registry.json');
  const mergePath = getArg('--merge');
  const sourcesArg = getArg('--sources');
  const sources = sourcesArg
    ? sourcesArg.split(',').map((s) => s.trim())
    : [...ALL_SOURCES];

  const stateFile = resolve('crawl-state.json');
  const state = loadCrawlState(stateFile);

  console.log('\n  MCP Registry Crawler (Multi-Source)');
  console.log(`  Sources: ${sources.join(', ')}`);
  console.log(`  Limit: ${limit} per source\n`);

  const allEntries: MCPEntry[] = [];

  // Load existing registry for merge if specified
  if (mergePath && existsSync(resolve(mergePath))) {
    const existing = JSON.parse(readFileSync(resolve(mergePath), 'utf-8')) as RegistryOutput;
    allEntries.push(...existing.entries);
    console.log(`  Loaded ${existing.entries.length} existing entries from ${mergePath}\n`);
  }

  // Crawl each source
  const sourceHandlers: Record<string, () => Promise<MCPEntry[]>> = {
    github: () => crawlGitHub(limit),
    npm: () => crawlNpm(10000),
    awesome: () => crawlAwesomeLists(),
    glama: () => crawlGlama(25000),
    pulsemcp: () => crawlPulseMCP(15000),
    smithery: () => crawlSmithery(5000),
    mcpso: () => crawlMcpSo(5000),
    mcphub: () => crawlMcpHub(5000),
  };

  let sourceNum = 1;
  const totalSources = sources.length;

  for (const src of sources) {
    const handler = sourceHandlers[src];
    if (!handler) {
      console.error(`  Unknown source: ${src}`);
      continue;
    }

    console.log(`  [${sourceNum}/${totalSources}] Crawling ${src}...`);
    try {
      const entries = await handler();
      allEntries.push(...entries);
      console.log(`    Found ${entries.length} entries\n`);

      state[src] = {
        lastCrawled: new Date().toISOString(),
        totalFetched: entries.length,
        errors: 0,
      };
    } catch (err) {
      console.error(`    ${src} FAILED: ${err instanceof Error ? err.message : String(err)}\n`);
      state[src] = {
        lastCrawled: new Date().toISOString(),
        totalFetched: 0,
        errors: (state[src]?.errors ?? 0) + 1,
      };
    }
    sourceNum++;
  }

  // Merge & deduplicate
  console.log(`  Total before dedup: ${allEntries.length}`);
  const deduped = deduplicateEntries(allEntries);
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
  const output: RegistryOutput = {
    crawledAt: new Date().toISOString(),
    totalEntries: deduped.length,
    sources: Object.fromEntries(bySource),
    categories: Object.fromEntries(byCategory),
    entries: deduped,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  saveCrawlState(stateFile, state);

  console.log(`\n  Saved to: ${outputPath}`);
  console.log(`  Total entries: ${deduped.length}`);
  console.log(`  Crawl state saved to: ${stateFile}\n`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
