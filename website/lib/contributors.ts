import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

export interface Contributor {
  github: string;
  country: string;
  role: "maintainer" | "contributor" | "reporter";
  contributions: string[];
  pr?: string;
}

export interface CountryStats {
  code: string;
  flag: string;
  count: number;
  contributions: number;
}

function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase();
  const offset = 0x1f1e6 - 65; // Regional indicator offset
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset
  );
}

const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const COUNTRY_CODE_RE = /^[A-Z]{2}$/;

export function loadContributors(): Contributor[] {
  try {
    const raw = readFileSync(
      join(process.cwd(), "..", "contributors.yaml"),
      "utf-8"
    );
    const all = (yaml.load(raw, { schema: yaml.CORE_SCHEMA }) as Contributor[]) ?? [];
    return all.filter(
      (c) => GITHUB_USERNAME_RE.test(c.github) && COUNTRY_CODE_RE.test(c.country)
    );
  } catch {
    return [];
  }
}

export function getCountryStats(contributors: Contributor[]): CountryStats[] {
  const map = new Map<string, { count: number; contributions: number }>();

  for (const c of contributors) {
    const existing = map.get(c.country) ?? { count: 0, contributions: 0 };
    map.set(c.country, {
      count: existing.count + 1,
      contributions: existing.contributions + c.contributions.length,
    });
  }

  return Array.from(map.entries())
    .map(([code, stats]) => ({
      code,
      flag: countryCodeToFlag(code),
      count: stats.count,
      contributions: stats.contributions,
    }))
    .sort((a, b) => b.contributions - a.contributions);
}
