/**
 * ATR-to-SARIF Converter
 *
 * Converts ATR scan results into SARIF v2.1.0 format for
 * GitHub Security tab integration via code scanning alerts.
 *
 * @module agent-threat-rules/converters/sarif
 */

import type { ATRRule, ATRMatch, ScanResult, ATRSeverity } from '../types.js';

/** SARIF severity levels */
type SARIFLevel = 'error' | 'warning' | 'note' | 'none';

/** Map ATR severity to SARIF level */
function severityToLevel(severity: ATRSeverity): SARIFLevel {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    case 'informational':
      return 'note';
    default:
      return 'note';
  }
}

/** Map ATR severity to SARIF security-severity score (0-10) */
function severityToScore(severity: ATRSeverity): string {
  switch (severity) {
    case 'critical':
      return '9.5';
    case 'high':
      return '8.0';
    case 'medium':
      return '5.5';
    case 'low':
      return '3.0';
    case 'informational':
      return '1.0';
    default:
      return '1.0';
  }
}

/** Build a unique rule index across all results */
function collectRules(
  results: readonly ScanResult[],
): { readonly rules: readonly ATRRule[]; readonly ruleIndex: ReadonlyMap<string, number> } {
  const ruleIndex = new Map<string, number>();
  const rules: ATRRule[] = [];

  for (const result of results) {
    for (const match of result.matches) {
      if (!ruleIndex.has(match.rule.id)) {
        ruleIndex.set(match.rule.id, rules.length);
        rules.push(match.rule);
      }
    }
  }

  return { rules, ruleIndex };
}

/**
 * Convert ATR scan results to SARIF v2.1.0 format.
 *
 * @param results - Array of ScanResult from evaluate/scanSkill
 * @param toolVersion - ATR version string (e.g. "1.0.0")
 * @returns SARIF JSON object ready for serialization
 */
export function scanResultToSARIF(
  results: readonly ScanResult[],
  toolVersion: string,
): object {
  const { rules, ruleIndex } = collectRules(results);

  const sarifRules = rules.map((rule) => ({
    id: rule.id,
    name: rule.id,
    shortDescription: { text: rule.title },
    fullDescription: { text: rule.description.slice(0, 1000) },
    helpUri: `https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/rules/${rule.tags.category}`,
    defaultConfiguration: {
      level: severityToLevel(rule.severity),
    },
    properties: {
      'security-severity': severityToScore(rule.severity),
      category: rule.tags.category,
      tags: ['security', 'ai-agent', rule.tags.category],
    },
  }));

  const sarifResults: object[] = [];

  for (const result of results) {
    for (const match of result.matches) {
      const idx = ruleIndex.get(match.rule.id) ?? 0;

      const location: Record<string, unknown> = {};
      if (result.input_file) {
        // Make path relative to CWD for SARIF — absolute paths leak local env info
        const cwd = process.cwd() + '/';
        const uri = result.input_file.startsWith(cwd)
          ? result.input_file.slice(cwd.length)
          : result.input_file;
        location.physicalLocation = {
          artifactLocation: {
            uri,
            uriBaseId: '%SRCROOT%',
          },
          region: { startLine: 1 },
        };
      }

      sarifResults.push({
        ruleId: match.rule.id,
        ruleIndex: idx,
        level: severityToLevel(match.rule.severity),
        message: {
          text: `${match.rule.title} (confidence: ${(match.confidence * 100).toFixed(0)}%, conditions: ${match.matchedConditions.join(', ')})`,
        },
        ...(result.input_file ? { locations: [location] } : {}),
        properties: {
          confidence: match.confidence,
          scan_type: result.scan_type,
          scan_context: match.scan_context,
          content_hash: result.content_hash,
        },
      });
    }
  }

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'ATR (Agent Threat Rules)',
            version: toolVersion,
            semanticVersion: toolVersion,
            informationUri: 'https://github.com/Agent-Threat-Rule/agent-threat-rules',
            rules: sarifRules,
          },
        },
        results: sarifResults,
      },
    ],
  };
}
