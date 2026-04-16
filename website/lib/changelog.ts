import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ChangelogSection {
  heading: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

/**
 * Parses CHANGELOG.md at build time. Format expected:
 *
 *   ## [VERSION] - YYYY-MM-DD
 *   ### SectionName
 *   - item1
 *   - item2 (may continue on next indented line)
 *
 * Returns entries in file order (newest first, per Keep-a-Changelog convention).
 */
export function loadChangelog(): ChangelogEntry[] {
  let raw: string;
  try {
    raw = readFileSync(join(process.cwd(), "..", "CHANGELOG.md"), "utf-8");
  } catch {
    return [];
  }
  const lines = raw.split("\n");
  const entries: ChangelogEntry[] = [];
  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;
  let currentItem: string | null = null;

  const flushItem = () => {
    if (currentItem !== null && currentSection) {
      currentSection.items.push(currentItem.trim());
    }
    currentItem = null;
  };

  for (const line of lines) {
    const versionMatch = line.match(/^##\s+\[([^\]]+)\]\s*(?:-\s*(.+))?$/);
    const sectionMatch = line.match(/^###\s+(.+)$/);
    const bulletMatch = line.match(/^-\s+(.+)$/);
    const continuationMatch = line.match(/^\s{2,}(\S.*)$/);

    if (versionMatch) {
      flushItem();
      if (currentEntry) entries.push(currentEntry);
      currentEntry = {
        version: versionMatch[1],
        date: (versionMatch[2] || "").trim(),
        sections: [],
      };
      currentSection = null;
    } else if (sectionMatch && currentEntry) {
      flushItem();
      currentSection = { heading: sectionMatch[1].trim(), items: [] };
      currentEntry.sections.push(currentSection);
    } else if (bulletMatch && currentSection) {
      flushItem();
      currentItem = bulletMatch[1];
    } else if (continuationMatch && currentItem !== null) {
      currentItem += " " + continuationMatch[1];
    } else if (line.trim() === "" && currentItem !== null) {
      flushItem();
    }
  }
  flushItem();
  if (currentEntry) entries.push(currentEntry);
  return entries;
}
