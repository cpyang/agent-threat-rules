/**
 * Generate HUMAN_REVIEW_QUEUE.md listing all rules with auto-generated
 * metadata that need human verification before stable promotion.
 *
 * This is the second half of the two-dimensional compliance model:
 *  - backfill-metadata.ts adds the metadata (Dimension 1)
 *  - this script lists what needs human review (Dimension 2)
 *
 * Usage: npx tsx scripts/generate-review-queue.ts
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseATRRule } from "../src/quality/adapters/atr.js";

const RULES_DIR = join(import.meta.dirname, "..", "rules");
const OUTPUT = join(import.meta.dirname, "..", "docs", "HUMAN_REVIEW_QUEUE.md");

function findYaml(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...findYaml(full));
    else if (e.endsWith(".yaml")) out.push(full);
  }
  return out;
}

interface QueueEntry {
  id: string;
  title: string;
  file: string;
  category: string;
  autoFields: string[];
}

const files = findYaml(RULES_DIR);
const entries: QueueEntry[] = [];

for (const f of files) {
  const content = readFileSync(f, "utf-8");
  const metadata = parseATRRule(content);
  if (!metadata.provenance) continue;

  const autoFields: string[] = [];
  for (const [field, value] of Object.entries(metadata.provenance)) {
    if (value === "auto-generated") autoFields.push(field);
  }

  if (autoFields.length === 0) continue;

  const rel = f.replace(RULES_DIR + "/", "");
  const category = rel.split("/")[0] ?? "unknown";

  entries.push({
    id: metadata.id,
    title: metadata.title,
    file: rel,
    category,
    autoFields,
  });
}

// Group by category
const byCategory: Record<string, QueueEntry[]> = {};
for (const e of entries) {
  if (!byCategory[e.category]) byCategory[e.category] = [];
  byCategory[e.category]!.push(e);
}

const lines: string[] = [];
lines.push("# Human Review Queue");
lines.push("");
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
lines.push("");
lines.push(
  "This file lists ATR rules with auto-generated metadata that need human " +
    "review before they can be promoted to stable. Auto-generated fields pass " +
    "the experimental gate (RFC-001 §4 two-dimensional compliance) but stable " +
    "promotion requires human-reviewed or community-contributed provenance.",
);
lines.push("");
lines.push("## How to review");
lines.push("");
lines.push("For each rule below:");
lines.push("");
lines.push("1. Open the file");
lines.push(
  "2. Check the auto-generated reference — is it the most accurate MITRE/OWASP mapping?",
);
lines.push(
  "   - If YES: change `metadata_provenance: <field>: auto-generated` to `human-reviewed`",
);
lines.push(
  "   - If NO: replace the reference with a better one, then mark as `human-reviewed`",
);
lines.push(
  "   - If UNCLEAR: leave as `auto-generated` and add a comment explaining why",
);
lines.push("3. Commit with message `review: verify metadata for <rule-id>`");
lines.push("");
lines.push(`## Summary: ${entries.length} rules need review`);
lines.push("");

for (const [category, items] of Object.entries(byCategory).sort()) {
  lines.push(`### ${category} (${items.length} rules)`);
  lines.push("");
  lines.push("| Rule ID | Title | Auto fields | File |");
  lines.push("|---------|-------|-------------|------|");
  for (const e of items.sort((a, b) => a.id.localeCompare(b.id))) {
    const titleShort =
      e.title.length > 50 ? e.title.slice(0, 47) + "..." : e.title;
    lines.push(
      `| ${e.id} | ${titleShort} | ${e.autoFields.join(", ")} | \`${e.file}\` |`,
    );
  }
  lines.push("");
}

writeFileSync(OUTPUT, lines.join("\n"));
console.log(`Wrote ${OUTPUT}`);
console.log(`Total rules needing review: ${entries.length}`);
for (const [c, items] of Object.entries(byCategory).sort()) {
  console.log(`  ${c.padEnd(25)} ${items.length}`);
}
