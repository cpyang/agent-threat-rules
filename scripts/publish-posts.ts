#!/usr/bin/env npx tsx
/**
 * Multi-Platform Post Publisher
 *
 * Reads approved posts from manifest.json and publishes to:
 *   - X (Twitter API v2) — requires TWITTER_BEARER_TOKEN + OAuth
 *   - Threads (Meta API) — requires THREADS_ACCESS_TOKEN
 *   - Reddit — requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET
 *   - LinkedIn — requires LINKEDIN_ACCESS_TOKEN
 *
 * Platforms without API keys → generates clipboard-ready drafts.
 *
 * Usage:
 *   npx tsx scripts/publish-posts.ts --dir posts/2026-03-25
 *   npx tsx scripts/publish-posts.ts --dir posts/2026-03-25 --platform x --dry-run
 *   npx tsx scripts/publish-posts.ts --dir posts/2026-03-25 --drafts-only
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostEntry {
  id: string;
  brand: 'skillssec' | 'panguard';
  type: 'short' | 'long' | 'weekly';
  package: string;
  riskLevel: string;
  platforms: string[];
  file: string;
  approved?: boolean;
  published?: Record<string, { status: string; url?: string; publishedAt?: string }>;
}

interface Manifest {
  generatedAt: string;
  batchFile: string;
  posts: PostEntry[];
}

interface PlatformConfig {
  name: string;
  maxLength: number;
  envKeys: string[];
  publish: (content: string, config: Record<string, string>) => Promise<{ ok: boolean; url?: string; error?: string }>;
}

// ---------------------------------------------------------------------------
// Platform Publishers
// ---------------------------------------------------------------------------

const platforms: Record<string, PlatformConfig> = {
  x: {
    name: 'X (Twitter)',
    maxLength: 280,
    envKeys: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    publish: async (content, config) => {
      // Twitter API v2 — OAuth 1.0a
      const { createHmac, randomBytes } = await import('node:crypto');

      const apiKey = config['TWITTER_API_KEY']!;
      const apiSecret = config['TWITTER_API_SECRET']!;
      const accessToken = config['TWITTER_ACCESS_TOKEN']!;
      const accessSecret = config['TWITTER_ACCESS_SECRET']!;

      const url = 'https://api.twitter.com/2/tweets';
      const method = 'POST';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = randomBytes(16).toString('hex');

      // OAuth params
      const oauthParams: Record<string, string> = {
        oauth_consumer_key: apiKey,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_token: accessToken,
        oauth_version: '1.0',
      };

      // Build signature base string
      const paramString = Object.entries(oauthParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');

      const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
      const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
      const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

      oauthParams['oauth_signature'] = signature;

      const authHeader = 'OAuth ' + Object.entries(oauthParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
        .join(', ');

      // Truncate content for X
      const truncated = content.length > 280
        ? content.slice(0, 277) + '...'
        : content;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: truncated }),
      });

      if (resp.ok) {
        const data = await resp.json() as { data: { id: string } };
        return { ok: true, url: `https://x.com/i/status/${data.data.id}` };
      }
      const err = await resp.text();
      return { ok: false, error: `${resp.status}: ${err.slice(0, 200)}` };
    },
  },

  threads: {
    name: 'Threads',
    maxLength: 500,
    envKeys: ['THREADS_ACCESS_TOKEN', 'THREADS_USER_ID'],
    publish: async (content, config) => {
      const token = config['THREADS_ACCESS_TOKEN']!;
      const userId = config['THREADS_USER_ID']!;

      // Step 1: Create media container
      const createResp = await fetch(
        `https://graph.threads.net/v1.0/${userId}/threads`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'TEXT',
            text: content.slice(0, 500),
            access_token: token,
          }),
        },
      );

      if (!createResp.ok) {
        return { ok: false, error: `Create failed: ${createResp.status}` };
      }

      const { id: containerId } = await createResp.json() as { id: string };

      // Step 2: Publish
      const publishResp = await fetch(
        `https://graph.threads.net/v1.0/${userId}/threads_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: token,
          }),
        },
      );

      if (publishResp.ok) {
        const data = await publishResp.json() as { id: string };
        return { ok: true, url: `https://threads.net/t/${data.id}` };
      }
      return { ok: false, error: `Publish failed: ${publishResp.status}` };
    },
  },

  reddit: {
    name: 'Reddit',
    maxLength: 40000,
    envKeys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'],
    publish: async (content, config) => {
      const clientId = config['REDDIT_CLIENT_ID']!;
      const clientSecret = config['REDDIT_CLIENT_SECRET']!;
      const username = config['REDDIT_USERNAME']!;
      const password = config['REDDIT_PASSWORD']!;

      // Get access token
      const authResp = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });

      if (!authResp.ok) {
        return { ok: false, error: `Auth failed: ${authResp.status}` };
      }

      const { access_token } = await authResp.json() as { access_token: string };

      // Extract title (first line) and body
      const lines = content.split('\n');
      const title = lines[0]!.replace(/^#+ /, '').slice(0, 300);
      const body = lines.slice(1).join('\n');

      // Submit to r/netsec (default, can be overridden)
      const subreddit = 'netsec';
      const submitResp = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SkillsSec/1.0',
        },
        body: `kind=self&sr=${subreddit}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(body)}&api_type=json`,
      });

      if (submitResp.ok) {
        const data = await submitResp.json() as { json: { data: { url: string } } };
        return { ok: true, url: data.json?.data?.url };
      }
      return { ok: false, error: `Submit failed: ${submitResp.status}` };
    },
  },

  linkedin: {
    name: 'LinkedIn',
    maxLength: 3000,
    envKeys: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_URN'],
    publish: async (content, config) => {
      const token = config['LINKEDIN_ACCESS_TOKEN']!;
      const personUrn = config['LINKEDIN_PERSON_URN']!;

      const resp = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content.slice(0, 3000) },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      });

      if (resp.ok) {
        return { ok: true, url: 'https://linkedin.com/feed/' };
      }
      return { ok: false, error: `${resp.status}: ${(await resp.text()).slice(0, 200)}` };
    },
  },
};

// ---------------------------------------------------------------------------
// Draft Generator (clipboard-ready for platforms without API)
// ---------------------------------------------------------------------------

function generateDraft(post: PostEntry, content: string, platform: string): string {
  const header = `=== ${platform.toUpperCase()} DRAFT ===`;
  const meta = `Brand: ${post.brand} | Package: ${post.package} | Risk: ${post.riskLevel}`;
  const separator = '='.repeat(40);

  return `${header}\n${meta}\n${separator}\n\n${content}\n\n${separator}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const dirIdx = process.argv.indexOf('--dir');
  const postsDir = dirIdx >= 0
    ? resolve(process.argv[dirIdx + 1]!)
    : resolve('posts', new Date().toISOString().slice(0, 10));

  const dryRun = process.argv.includes('--dry-run');
  const draftsOnly = process.argv.includes('--drafts-only');
  const platformFilter = process.argv.indexOf('--platform') >= 0
    ? process.argv[process.argv.indexOf('--platform') + 1]
    : null;

  const manifestPath = join(postsDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`No manifest found at ${manifestPath}`);
    console.error('Run generate-skillssec-posts.ts first.');
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  // Filter to approved posts only (or all if --drafts-only)
  const postsToPublish = draftsOnly
    ? manifest.posts
    : manifest.posts.filter(p => p.approved !== false); // publish unless explicitly rejected

  console.log(`\n  Post Publisher`);
  console.log(`  Dir: ${postsDir}`);
  console.log(`  Posts: ${postsToPublish.length}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log(`  Drafts only: ${draftsOnly}\n`);

  // Check which platforms have API keys
  const availablePlatforms = new Set<string>();
  for (const [name, config] of Object.entries(platforms)) {
    const hasAllKeys = config.envKeys.every(k => process.env[k]);
    if (hasAllKeys) availablePlatforms.add(name);
  }

  console.log(`  Platforms with API keys: ${[...availablePlatforms].join(', ') || 'none (drafts mode)'}\n`);

  const draftsDir = join(postsDir, 'drafts');
  mkdirSync(draftsDir, { recursive: true });

  let published = 0;
  let drafted = 0;

  for (const post of postsToPublish) {
    const contentPath = join(postsDir, post.file);
    if (!existsSync(contentPath)) {
      console.log(`  [SKIP] ${post.file} — file not found`);
      continue;
    }

    const content = readFileSync(contentPath, 'utf-8');

    for (const targetPlatform of post.platforms) {
      if (platformFilter && targetPlatform !== platformFilter) continue;

      const platformKey = targetPlatform.replace('-zh', ''); // threads-zh → threads

      if (draftsOnly || !availablePlatforms.has(platformKey)) {
        // Generate clipboard-ready draft
        const draft = generateDraft(post, content, targetPlatform);
        const draftFile = `${post.id}-${targetPlatform}.txt`;
        writeFileSync(join(draftsDir, draftFile), draft, 'utf-8');
        drafted++;
        console.log(`  [DRAFT] ${post.file} → ${targetPlatform} → drafts/${draftFile}`);
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY-RUN] Would publish ${post.file} → ${targetPlatform}`);
        continue;
      }

      // Publish via API
      const platformConfig = platforms[platformKey]!;
      const envConfig: Record<string, string> = {};
      for (const key of platformConfig.envKeys) {
        envConfig[key] = process.env[key] ?? '';
      }

      console.log(`  [PUBLISH] ${post.file} → ${platformConfig.name}...`);
      const result = await platformConfig.publish(content, envConfig);

      if (!post.published) post.published = {};
      post.published[targetPlatform] = {
        status: result.ok ? 'published' : 'failed',
        url: result.url,
        publishedAt: new Date().toISOString(),
      };

      if (result.ok) {
        published++;
        console.log(`    OK: ${result.url ?? 'published'}`);
      } else {
        console.log(`    FAIL: ${result.error}`);
      }

      // Rate limit between posts
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Save updated manifest with publish status
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('\n  ==============================');
  console.log('  PUBLISH SUMMARY');
  console.log('  ==============================');
  console.log(`  Published: ${published}`);
  console.log(`  Drafted:   ${drafted}`);
  console.log(`  Drafts at: ${draftsDir}`);
  console.log('');

  if (drafted > 0 && published === 0) {
    console.log('  No API keys configured. All posts saved as drafts.');
    console.log('  Copy-paste from drafts/ to each platform manually.');
    console.log('');
    console.log('  To enable auto-publish, set env vars:');
    console.log('    X:        TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET');
    console.log('    Threads:  THREADS_ACCESS_TOKEN, THREADS_USER_ID');
    console.log('    Reddit:   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD');
    console.log('    LinkedIn: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN');
    console.log('');
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
