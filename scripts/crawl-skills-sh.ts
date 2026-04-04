#!/usr/bin/env npx tsx
/**
 * Skills.sh SKILL.md Bulk Crawler
 *
 * Crawls skills.sh to discover all skills and download their SKILL.md files.
 *
 * Strategy:
 *   Phase 1 — Scrape skills.sh homepage RSC stream for top 600 skills (with installs)
 *   Phase 2 — Scrape /official page for all verified publisher slugs
 *   Phase 3 — For each publisher, scrape their skills.sh page to discover all repos + skills
 *   Phase 4 — For each skill, download SKILL.md from GitHub raw content
 *
 * Outputs:
 *   data/skills-sh/registry.json         — Full skill registry metadata
 *   data/skills-sh/skills/{owner}/{skill}.md — Individual SKILL.md files
 *   data/skills-sh/errors.json           — Failed downloads log
 *
 * Usage:
 *   bun run scripts/crawl-skills-sh.ts [options]
 *
 * Options:
 *   --limit <n>       Max skills to download SKILL.md for (default: unlimited)
 *   --skip-download   Only build registry, skip SKILL.md download
 *   --resume          Resume from existing registry (default: true)
 *   --concurrency <n> Parallel SKILL.md downloads (default: 5)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillEntry {
  readonly source: string; // e.g. "anthropics/skills"
  readonly skillId: string; // e.g. "frontend-design"
  readonly name: string;
  readonly installs: number;
  readonly publisher: string; // derived: "anthropics"
  readonly repo: string; // derived: "skills"
  readonly discoveredFrom: 'homepage' | 'official' | 'publisher-page';
  readonly skillMdPath?: string; // local path if downloaded
  readonly skillMdUrl?: string; // GitHub raw URL
  readonly downloadedAt?: string;
}

interface CrawlRegistry {
  readonly crawledAt: string;
  readonly totalSkills: number;
  readonly totalPublishers: number;
  readonly totalWithSkillMd: number;
  readonly skills: readonly SkillEntry[];
}

interface CrawlError {
  readonly source: string;
  readonly skillId: string;
  readonly url: string;
  readonly error: string;
  readonly timestamp: string;
  readonly attempt: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = 'https://skills.sh';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const DATA_DIR = resolve(__dirname, '..', 'data', 'skills-sh');
const SKILLS_DIR = resolve(DATA_DIR, 'skills');
const REGISTRY_PATH = resolve(DATA_DIR, 'registry.json');
const ERRORS_PATH = resolve(DATA_DIR, 'errors.json');

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;
const REQUEST_INTERVAL_MS = 200; // 5 req/sec
const GITHUB_REQUEST_INTERVAL_MS = 250; // 4 req/sec for GitHub (more conservative)

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): {
  readonly limit: number;
  readonly skipDownload: boolean;
  readonly resume: boolean;
  readonly concurrency: number;
} {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };
  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  return {
    limit: parseInt(getArg('limit') ?? '0', 10) || 0,
    skipDownload: hasFlag('skip-download'),
    resume: !hasFlag('no-resume'),
    concurrency: parseInt(getArg('concurrency') ?? '5', 10) || 5,
  };
}

// ---------------------------------------------------------------------------
// Rate-limited fetch
// ---------------------------------------------------------------------------

let lastFetchTime = 0;

async function rateLimitedFetch(
  url: string,
  intervalMs: number = REQUEST_INTERVAL_MS
): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastFetchTime;
  if (elapsed < intervalMs) {
    await sleep(intervalMs - elapsed);
  }
  lastFetchTime = Date.now();
  return fetch(url, {
    headers: {
      'User-Agent': 'ATR-Skills-Crawler/1.0 (https://github.com/Agent-Threat-Rule/agent-threat-rules)',
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  intervalMs: number = REQUEST_INTERVAL_MS,
  maxRetries: number = MAX_RETRIES
): Promise<{ readonly ok: boolean; readonly text: string; readonly status: number }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await rateLimitedFetch(url, intervalMs);
      const text = await resp.text();
      if (resp.ok) {
        return { ok: true, text, status: resp.status };
      }
      if (resp.status === 429 || resp.status >= 500) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        process.stderr.write(
          `[retry] ${url} status=${resp.status} attempt=${attempt}/${maxRetries} waiting ${delay}ms\n`
        );
        await sleep(delay);
        continue;
      }
      return { ok: false, text, status: resp.status };
    } catch (err) {
      if (attempt === maxRetries) {
        return {
          ok: false,
          text: err instanceof Error ? err.message : String(err),
          status: 0,
        };
      }
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      process.stderr.write(
        `[retry] ${url} error=${err instanceof Error ? err.message : err} attempt=${attempt}/${maxRetries} waiting ${delay}ms\n`
      );
      await sleep(delay);
    }
  }
  return { ok: false, text: 'max retries exceeded', status: 0 };
}

// ---------------------------------------------------------------------------
// Phase 1: Scrape homepage RSC for top skills
// ---------------------------------------------------------------------------

function parseSkillsFromRSC(rscText: string): readonly SkillEntry[] {
  // The HTML may have escaped quotes (\") or unescaped quotes (")
  // We try both patterns
  const patterns = [
    // Escaped quotes (HTML page)
    /source\\":\\"([^\\]+)\\"[,}].*?skillId\\":\\"([^\\]+)\\".*?name\\":\\"([^\\]+)\\".*?installs\\":(\d+)/g,
    // Unescaped quotes (RSC stream)
    /source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":(\d+)/g,
  ];

  const results: SkillEntry[] = [];
  const seen = new Set<string>();

  for (const regex of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rscText)) !== null) {
      const source = match[1];
      const skillId = match[2];
      const key = `${source}/${skillId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const parts = source.split('/');
      results.push({
        source,
        skillId,
        name: match[3],
        installs: parseInt(match[4], 10),
        publisher: parts[0] ?? source,
        repo: parts[1] ?? '',
        discoveredFrom: 'homepage',
      });
    }
  }
  return results;
}

async function crawlHomepage(): Promise<readonly SkillEntry[]> {
  process.stderr.write('[phase1] Fetching skills.sh homepage RSC stream...\n');
  const resp = await fetchWithRetry(`${BASE_URL}`, REQUEST_INTERVAL_MS);
  if (!resp.ok) {
    process.stderr.write(
      `[phase1] Failed to fetch homepage: status=${resp.status}\n`
    );
    return [];
  }
  const skills = parseSkillsFromRSC(resp.text);
  process.stderr.write(`[phase1] Found ${skills.length} skills from homepage\n`);
  return skills;
}

// ---------------------------------------------------------------------------
// Phase 2: Scrape /official for publisher slugs
// ---------------------------------------------------------------------------

function parsePublisherSlugs(html: string): readonly string[] {
  // Pattern: href="/publisherName" where publisherName is a simple slug
  const regex = /href="\/([a-zA-Z0-9][a-zA-Z0-9_-]*)"/g;
  const slugs = new Set<string>();
  const navPages = new Set([
    'official',
    'audits',
    'docs',
    'trending',
    'hot',
    'favicon',
    '_next',
  ]);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    if (!navPages.has(slug) && !slug.startsWith('_')) {
      slugs.add(slug);
    }
  }
  return [...slugs].sort();
}

async function crawlOfficialPublishers(): Promise<readonly string[]> {
  process.stderr.write('[phase2] Fetching /official for publisher list...\n');
  const resp = await fetchWithRetry(`${BASE_URL}/official`, REQUEST_INTERVAL_MS);
  if (!resp.ok) {
    process.stderr.write(
      `[phase2] Failed to fetch /official: status=${resp.status}\n`
    );
    return [];
  }
  const slugs = parsePublisherSlugs(resp.text);
  process.stderr.write(
    `[phase2] Found ${slugs.length} publishers from /official\n`
  );
  return slugs;
}

// ---------------------------------------------------------------------------
// Phase 3: Scrape each publisher page for all repos + skills
// ---------------------------------------------------------------------------

interface RepoInfo {
  readonly publisher: string;
  readonly repo: string;
  readonly skillCount: number;
}

function parsePublisherRepos(
  html: string,
  publisher: string
): readonly RepoInfo[] {
  // Publisher page lists repos with links like href="/publisher/repo"
  // and skill counts like "18 skills" or "147 skills"
  const repos: RepoInfo[] = [];
  const escaped = escapeRegExp(publisher);

  // Match href="/publisher/repo" followed by skill count
  const repoRegex = new RegExp(
    `href="/${escaped}/([a-zA-Z0-9_.-]+)"[^>]*>.*?(?:(\\d+)<!-- --> <!-- -->skills?|<!-- --> <!-- -->(\\d+)<!-- --> <!-- -->skill)`,
    'gs'
  );
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = repoRegex.exec(html)) !== null) {
    const repo = match[1];
    if (seen.has(repo)) continue;
    seen.add(repo);
    const count = parseInt(match[2] ?? match[3] ?? '0', 10);
    repos.push({ publisher, repo, skillCount: count });
  }

  // Fallback: just find href patterns without counts
  if (repos.length === 0) {
    const simpleRegex = new RegExp(
      `href="/${escaped}/([a-zA-Z0-9_.-]+)"`,
      'g'
    );
    while ((match = simpleRegex.exec(html)) !== null) {
      const repo = match[1];
      if (seen.has(repo) || repo.startsWith('_next') || repo === 'api') continue;
      seen.add(repo);
      repos.push({ publisher, repo, skillCount: 0 });
    }
  }

  return repos;
}

function parseRepoPage(
  html: string,
  publisher: string,
  repo: string
): readonly SkillEntry[] {
  // Repo page (e.g., /anthropics/skills) lists all skills
  // Pattern 1: full RSC-style data
  const rscSkills = parseSkillsFromRSC(html);
  if (rscSkills.length > 0) {
    return rscSkills.map((s) => ({
      ...s,
      discoveredFrom: 'publisher-page' as const,
    }));
  }

  // Pattern 2: href links to individual skills /{publisher}/{repo}/{skillId}
  const results: SkillEntry[] = [];
  const escaped = escapeRegExp(publisher);
  const escapedRepo = escapeRegExp(repo);
  const hrefRegex = new RegExp(
    `href="/${escaped}/${escapedRepo}/([a-zA-Z0-9_.-]+)"`,
    'g'
  );
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = hrefRegex.exec(html)) !== null) {
    const skillId = match[1];
    if (seen.has(skillId)) continue;
    seen.add(skillId);
    results.push({
      source: `${publisher}/${repo}`,
      skillId,
      name: skillId,
      installs: 0,
      publisher,
      repo,
      discoveredFrom: 'publisher-page',
    });
  }

  return results;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function crawlPublisherPages(
  publishers: readonly string[]
): Promise<readonly SkillEntry[]> {
  process.stderr.write(
    `[phase3] Crawling ${publishers.length} publisher pages for repo discovery...\n`
  );
  const allRepos: RepoInfo[] = [];
  let count = 0;

  for (const publisher of publishers) {
    const resp = await fetchWithRetry(
      `${BASE_URL}/${publisher}`,
      REQUEST_INTERVAL_MS
    );
    count++;
    if (count % 10 === 0) {
      process.stderr.write(
        `[phase3] Progress: ${count}/${publishers.length} publishers\n`
      );
    }
    if (!resp.ok) {
      process.stderr.write(
        `[phase3] Failed to fetch /${publisher}: status=${resp.status}\n`
      );
      continue;
    }
    const repos = parsePublisherRepos(resp.text, publisher);
    allRepos.push(...repos);
  }

  const totalExpectedSkills = allRepos.reduce(
    (sum, r) => sum + r.skillCount,
    0
  );
  process.stderr.write(
    `[phase3] Found ${allRepos.length} repos (expecting ~${totalExpectedSkills} skills)\n`
  );

  // Phase 3.5: Crawl each repo page + use GitHub tree API for full skill discovery
  process.stderr.write(
    `[phase3.5] Crawling ${allRepos.length} repo pages + GitHub trees...\n`
  );
  const allSkills: SkillEntry[] = [];
  let repoCount = 0;

  for (const repo of allRepos) {
    repoCount++;
    if (repoCount % 20 === 0) {
      process.stderr.write(
        `[phase3.5] Progress: ${repoCount}/${allRepos.length} repos (${allSkills.length} skills found)\n`
      );
    }

    // Strategy 1: Fetch the skills.sh repo page for skill links
    const repoResp = await fetchWithRetry(
      `${BASE_URL}/${repo.publisher}/${repo.repo}`,
      REQUEST_INTERVAL_MS
    );
    if (repoResp.ok) {
      const repoSkills = parseRepoPage(
        repoResp.text,
        repo.publisher,
        repo.repo
      );
      if (repoSkills.length > 0) {
        allSkills.push(...repoSkills);
        continue; // Got skills from web page, skip GitHub tree
      }
    }

    // Strategy 2: Use GitHub tree API to discover all SKILL.md files
    const treePaths = await getGitHubTreePaths(
      `${repo.publisher}/${repo.repo}`
    );
    for (const [skillDir] of treePaths) {
      allSkills.push({
        source: `${repo.publisher}/${repo.repo}`,
        skillId: skillDir,
        name: skillDir,
        installs: 0,
        publisher: repo.publisher,
        repo: repo.repo,
        discoveredFrom: 'publisher-page',
      });
    }
  }

  process.stderr.write(
    `[phase3.5] Found ${allSkills.length} skills from repo pages + GitHub trees\n`
  );
  return allSkills;
}

// ---------------------------------------------------------------------------
// Dedup + merge
// ---------------------------------------------------------------------------

function deduplicateSkills(
  ...sources: readonly (readonly SkillEntry[])[]
): readonly SkillEntry[] {
  const map = new Map<string, SkillEntry>();

  for (const skills of sources) {
    for (const skill of skills) {
      const key = `${skill.source}/${skill.skillId}`;
      const existing = map.get(key);
      if (!existing || skill.installs > existing.installs) {
        map.set(key, skill);
      }
    }
  }

  return [...map.values()].sort((a, b) => b.installs - a.installs);
}

// ---------------------------------------------------------------------------
// Phase 4: Download SKILL.md from GitHub
// ---------------------------------------------------------------------------

function getGitHubRawUrl(source: string, skillId: string): string {
  return `${GITHUB_RAW_BASE}/${source}/main/skills/${skillId}/SKILL.md`;
}

function getLocalSkillPath(publisher: string, skillId: string): string {
  return resolve(SKILLS_DIR, publisher, `${skillId}.md`);
}

// Cache for GitHub tree lookups (per source repo)
const treeCache = new Map<string, Map<string, string>>();

async function getGitHubTreePaths(
  source: string
): Promise<Map<string, string>> {
  if (treeCache.has(source)) return treeCache.get(source)!;

  const url = `https://api.github.com/repos/${source}/git/trees/main?recursive=1`;
  const resp = await fetchWithRetry(url, GITHUB_REQUEST_INTERVAL_MS, 2);

  const skillMdPaths = new Map<string, string>();
  if (resp.ok) {
    try {
      const data = JSON.parse(resp.text);
      const tree = data.tree as Array<{ path: string; type: string }>;
      for (const item of tree) {
        if (item.path.endsWith('/SKILL.md') && item.type === 'blob') {
          // Extract the skill directory name (parent of SKILL.md)
          const parts = item.path.split('/');
          const skillDir = parts[parts.length - 2];
          skillMdPaths.set(skillDir, item.path);
        }
      }
    } catch {
      // JSON parse failure, ignore
    }
  }
  treeCache.set(source, skillMdPaths);
  return skillMdPaths;
}

async function downloadSkillMd(
  skill: SkillEntry,
  errors: CrawlError[]
): Promise<SkillEntry> {
  const localPath = getLocalSkillPath(skill.publisher, skill.skillId);

  // Resume: skip if already downloaded
  if (existsSync(localPath)) {
    return {
      ...skill,
      skillMdPath: localPath,
      skillMdUrl: getGitHubRawUrl(skill.source, skill.skillId),
      downloadedAt: 'pre-existing',
    };
  }

  // Build candidate URLs in priority order
  const candidateUrls = [
    // Standard: skills/{skillId}/SKILL.md on main
    `${GITHUB_RAW_BASE}/${skill.source}/main/skills/${skill.skillId}/SKILL.md`,
    // Root level: {skillId}/SKILL.md
    `${GITHUB_RAW_BASE}/${skill.source}/main/${skill.skillId}/SKILL.md`,
    // Master branch variants
    `${GITHUB_RAW_BASE}/${skill.source}/master/skills/${skill.skillId}/SKILL.md`,
    `${GITHUB_RAW_BASE}/${skill.source}/master/${skill.skillId}/SKILL.md`,
  ];

  for (const url of candidateUrls) {
    const resp = await fetchWithRetry(url, GITHUB_REQUEST_INTERVAL_MS, 1);
    if (resp.ok && resp.text.length > 0) {
      mkdirSync(dirname(localPath), { recursive: true });
      writeFileSync(localPath, resp.text, 'utf-8');
      return {
        ...skill,
        skillMdPath: localPath,
        skillMdUrl: url,
        downloadedAt: new Date().toISOString(),
      };
    }
  }

  // Fallback: use GitHub tree API to find the actual path
  const treePaths = await getGitHubTreePaths(skill.source);
  if (treePaths.size > 0) {
    // Try exact match on directory name
    const exactPath = treePaths.get(skill.skillId);
    if (exactPath) {
      const treeUrl = `${GITHUB_RAW_BASE}/${skill.source}/main/${exactPath}`;
      const resp = await fetchWithRetry(treeUrl, GITHUB_REQUEST_INTERVAL_MS, 1);
      if (resp.ok && resp.text.length > 0) {
        mkdirSync(dirname(localPath), { recursive: true });
        writeFileSync(localPath, resp.text, 'utf-8');
        return {
          ...skill,
          skillMdPath: localPath,
          skillMdUrl: treeUrl,
          downloadedAt: new Date().toISOString(),
        };
      }
    }

    // Try fuzzy match: skillId might have a prefix like "vercel-" removed
    for (const [dirName, path] of treePaths) {
      if (
        skill.skillId.endsWith(dirName) ||
        dirName.endsWith(skill.skillId) ||
        skill.skillId.includes(dirName) ||
        dirName.includes(skill.skillId)
      ) {
        const treeUrl = `${GITHUB_RAW_BASE}/${skill.source}/main/${path}`;
        const resp = await fetchWithRetry(
          treeUrl,
          GITHUB_REQUEST_INTERVAL_MS,
          1
        );
        if (resp.ok && resp.text.length > 0) {
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, resp.text, 'utf-8');
          return {
            ...skill,
            skillMdPath: localPath,
            skillMdUrl: treeUrl,
            downloadedAt: new Date().toISOString(),
          };
        }
      }
    }
  }

  errors.push({
    source: skill.source,
    skillId: skill.skillId,
    url: candidateUrls[0],
    error: `All URL patterns and tree lookup failed`,
    timestamp: new Date().toISOString(),
    attempt: MAX_RETRIES,
  });

  return skill;
}

async function downloadAllSkillMds(
  skills: readonly SkillEntry[],
  concurrency: number,
  limit: number
): Promise<{
  readonly updatedSkills: readonly SkillEntry[];
  readonly errors: readonly CrawlError[];
}> {
  const toDownload = limit > 0 ? skills.slice(0, limit) : [...skills];
  const errors: CrawlError[] = [];
  const results: SkillEntry[] = [];
  let completed = 0;
  let downloaded = 0;
  let skipped = 0;

  process.stderr.write(
    `[phase4] Downloading SKILL.md for ${toDownload.length} skills (concurrency=${concurrency})...\n`
  );

  // Process in batches for concurrency control
  for (let i = 0; i < toDownload.length; i += concurrency) {
    const batch = toDownload.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((skill) => downloadSkillMd(skill, errors))
    );
    results.push(...batchResults);

    for (const r of batchResults) {
      completed++;
      if (r.downloadedAt === 'pre-existing') {
        skipped++;
      } else if (r.skillMdPath) {
        downloaded++;
      }
    }

    if (completed % 100 === 0 || completed === toDownload.length) {
      process.stderr.write(
        `[phase4] Progress: ${completed}/${toDownload.length} (downloaded=${downloaded}, skipped=${skipped}, errors=${errors.length})\n`
      );
    }
  }

  // For skills beyond the limit, keep them as-is
  const remaining = limit > 0 ? skills.slice(limit) : [];
  return {
    updatedSkills: [...results, ...remaining],
    errors,
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadExistingRegistry(): CrawlRegistry | null {
  if (!existsSync(REGISTRY_PATH)) return null;
  try {
    const raw = readFileSync(REGISTRY_PATH, 'utf-8');
    return JSON.parse(raw) as CrawlRegistry;
  } catch {
    return null;
  }
}

function saveRegistry(registry: CrawlRegistry): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  process.stderr.write(
    `[save] Registry saved: ${registry.totalSkills} skills -> ${REGISTRY_PATH}\n`
  );
}

function saveErrors(errors: readonly CrawlError[]): void {
  if (errors.length === 0) return;
  writeFileSync(ERRORS_PATH, JSON.stringify(errors, null, 2), 'utf-8');
  process.stderr.write(
    `[save] Errors saved: ${errors.length} errors -> ${ERRORS_PATH}\n`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const config = parseArgs();
  process.stderr.write(
    `[start] Skills.sh Crawler — limit=${config.limit || 'unlimited'} skipDownload=${config.skipDownload} resume=${config.resume} concurrency=${config.concurrency}\n`
  );

  // Check for existing registry for resume
  const existing = config.resume ? loadExistingRegistry() : null;
  if (existing) {
    process.stderr.write(
      `[resume] Found existing registry with ${existing.totalSkills} skills\n`
    );
  }

  // Phase 1: Homepage top skills
  const homepageSkills = await crawlHomepage();

  // Phase 2: Official publishers
  const publishers = await crawlOfficialPublishers();

  // Phase 3: Publisher pages
  const publisherSkills = await crawlPublisherPages(publishers);

  // Also extract publishers from homepage skills that aren't in official list
  const homepagePublishers = [
    ...new Set(homepageSkills.map((s) => s.publisher)),
  ].filter((p) => !publishers.includes(p));

  let extraPublisherSkills: readonly SkillEntry[] = [];
  if (homepagePublishers.length > 0) {
    process.stderr.write(
      `[phase3b] Found ${homepagePublishers.length} additional publishers from homepage\n`
    );
    extraPublisherSkills = await crawlPublisherPages(homepagePublishers);
  }

  // Merge existing registry skills if resuming
  const existingSkills = existing?.skills ?? [];

  // Deduplicate all sources
  const allSkills = deduplicateSkills(
    existingSkills,
    homepageSkills,
    publisherSkills,
    extraPublisherSkills
  );

  process.stderr.write(
    `[merge] Total unique skills after dedup: ${allSkills.length}\n`
  );

  const uniquePublishers = new Set(allSkills.map((s) => s.publisher));
  process.stderr.write(
    `[merge] Total unique publishers: ${uniquePublishers.size}\n`
  );

  // Phase 4: Download SKILL.md files
  let finalSkills = allSkills;
  let errors: readonly CrawlError[] = [];

  if (!config.skipDownload) {
    const downloadResult = await downloadAllSkillMds(
      allSkills,
      config.concurrency,
      config.limit
    );
    finalSkills = downloadResult.updatedSkills;
    errors = downloadResult.errors;
    saveErrors(errors);
  }

  // Build and save registry
  const registry: CrawlRegistry = {
    crawledAt: new Date().toISOString(),
    totalSkills: finalSkills.length,
    totalPublishers: uniquePublishers.size,
    totalWithSkillMd: finalSkills.filter((s) => s.skillMdPath).length,
    skills: finalSkills,
  };

  saveRegistry(registry);

  // Summary
  process.stderr.write('\n=== CRAWL COMPLETE ===\n');
  process.stderr.write(`Total skills:      ${registry.totalSkills}\n`);
  process.stderr.write(`Total publishers:  ${registry.totalPublishers}\n`);
  process.stderr.write(`With SKILL.md:     ${registry.totalWithSkillMd}\n`);
  process.stderr.write(`Download errors:   ${errors.length}\n`);
  process.stderr.write(`Registry:          ${REGISTRY_PATH}\n`);
  if (errors.length > 0) {
    process.stderr.write(`Error log:         ${ERRORS_PATH}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`[fatal] ${err}\n`);
  process.exit(1);
});
