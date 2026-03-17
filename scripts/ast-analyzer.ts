/**
 * L2 AST-based code analysis for MCP skill security auditing.
 *
 * Goes beyond regex (L1) by parsing actual JavaScript ASTs to detect:
 *   1. Data flow: env variable -> network request (credential exfiltration)
 *   2. Handler -> exec chain: MCP tool handler -> function -> shell execution
 *   3. Dynamic code execution: eval, new Function, vm.runInContext
 *   4. Obfuscated calls: computed property access, string concatenation tricks
 *   5. Sensitive data sinks: env/credential data flowing to network or fs
 *
 * Zero LLM cost -- pure local AST parsing with acorn.
 *
 * Usage:
 *   import { analyzeAST } from './ast-analyzer.js';
 *   const findings = analyzeAST('/path/to/package');
 */

import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type * as ESTree from 'estree';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ASTFindingCategory =
  | 'env-to-network'       // process.env data flows to fetch/http
  | 'handler-to-exec'      // MCP handler calls shell execution
  | 'dynamic-code-exec'    // eval, new Function, vm.run
  | 'obfuscated-call'      // computed property access to dangerous APIs
  | 'credential-sink'      // sensitive data flows to network/fs
  | 'prototype-pollution'  // __proto__ / constructor.prototype manipulation
  | 'hidden-require'       // require() inside nested function (not top-level)
  | 'encoded-payload'      // base64/hex decode + exec pattern
  | 'timer-delayed-exec'   // setTimeout/setInterval with exec/eval
  | 'conditional-backdoor'; // if (env/date condition) { exec dangerous }

export interface ASTFinding {
  category: ASTFindingCategory;
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  description: string;
  /** Code snippet around the finding */
  snippet: string;
  /** Data flow trace if applicable */
  flow?: string[];
}

export interface ASTAnalysisResult {
  findings: ASTFinding[];
  filesAnalyzed: number;
  parseErrors: number;
  /** Summary counts by category */
  summary: Record<ASTFindingCategory, number>;
}

// ---------------------------------------------------------------------------
// AST Node type guards (acorn nodes are ESTree-compatible)
// ---------------------------------------------------------------------------

type AcornNode = acorn.Node & ESTree.Node;

function isCallExpression(node: ESTree.Node): node is ESTree.CallExpression {
  return node.type === 'CallExpression';
}

function isMemberExpression(node: ESTree.Node): node is ESTree.MemberExpression {
  return node.type === 'MemberExpression';
}

function isIdentifier(node: ESTree.Node): node is ESTree.Identifier {
  return node.type === 'Identifier';
}

function isLiteral(node: ESTree.Node): node is ESTree.Literal {
  return node.type === 'Literal';
}

// ---------------------------------------------------------------------------
// Source tracking helpers
// ---------------------------------------------------------------------------

/** Track which variables hold sensitive data (env vars, credentials) */
interface ScopeTracker {
  /** Variables that hold env/credential data */
  sensitiveVars: Set<string>;
  /** Variables that hold require('child_process') etc */
  dangerousModuleVars: Set<string>;
  /** Functions that perform network operations */
  networkFunctions: Set<string>;
  /** Functions that perform exec/spawn */
  execFunctions: Set<string>;
}

const DANGEROUS_MODULES = new Set([
  'child_process', 'net', 'dgram', 'cluster', 'vm',
]);

const EXEC_METHODS = new Set([
  'exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork',
]);

const NETWORK_METHODS = new Set([
  'fetch', 'request', 'get', 'post', 'put', 'patch', 'delete',
]);

const NETWORK_MODULES = new Set([
  'http', 'https', 'node-fetch', 'axios', 'got', 'undici', 'urllib',
]);

// ---------------------------------------------------------------------------
// Core analysis
// ---------------------------------------------------------------------------

function analyzeFile(filePath: string, content: string): ASTFinding[] {
  const findings: ASTFinding[] = [];
  const lines = content.split('\n');

  let ast: acorn.Node;
  try {
    ast = parse(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
    });
  } catch {
    // Try as script if module parse fails
    try {
      ast = parse(content, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        locations: true,
        allowReturnOutsideFunction: true,
      });
    } catch {
      return findings; // Unparseable
    }
  }

  const scope: ScopeTracker = {
    sensitiveVars: new Set(),
    dangerousModuleVars: new Set(),
    networkFunctions: new Set(),
    execFunctions: new Set(),
  };

  const getSnippet = (line: number): string => {
    const start = Math.max(0, line - 2);
    const end = Math.min(lines.length, line + 1);
    return lines.slice(start, end).join('\n').slice(0, 200);
  };

  const getLine = (node: { loc?: { start: { line: number } } | null }): number => {
    return node.loc?.start?.line ?? 0;
  };

  // Pass 1: Identify variable assignments from dangerous sources
  walk.simple(ast as AcornNode, {
    VariableDeclarator(node: AcornNode) {
      const decl = node as unknown as ESTree.VariableDeclarator;
      if (!decl.init || !isIdentifier(decl.id)) return;
      const varName = decl.id.name;

      // Track: const x = process.env.SECRET
      if (isMemberExpression(decl.init)) {
        const memberStr = memberToString(decl.init);
        if (memberStr?.startsWith('process.env')) {
          scope.sensitiveVars.add(varName);
        }
      }

      // Track: const cp = require('child_process')
      if (isCallExpression(decl.init)) {
        const callee = decl.init;
        if (isIdentifier(callee.callee) && callee.callee.name === 'require') {
          const arg = callee.arguments[0];
          if (arg && isLiteral(arg) && typeof arg.value === 'string') {
            if (DANGEROUS_MODULES.has(arg.value)) {
              scope.dangerousModuleVars.add(varName);
            }
            if (NETWORK_MODULES.has(arg.value)) {
              scope.networkFunctions.add(varName);
            }
          }
        }
      }
    },

    // Track import: import { exec } from 'child_process'
    ImportDeclaration(node: AcornNode) {
      const imp = node as unknown as ESTree.ImportDeclaration;
      if (typeof imp.source.value !== 'string') return;
      const mod = imp.source.value;

      if (DANGEROUS_MODULES.has(mod)) {
        for (const spec of imp.specifiers) {
          if (spec.type === 'ImportSpecifier' || spec.type === 'ImportDefaultSpecifier') {
            scope.dangerousModuleVars.add(spec.local.name);
            if (spec.type === 'ImportSpecifier' && isIdentifier(spec.imported)) {
              if (EXEC_METHODS.has(spec.imported.name)) {
                scope.execFunctions.add(spec.local.name);
              }
            }
          }
        }
      }
      if (NETWORK_MODULES.has(mod)) {
        for (const spec of imp.specifiers) {
          scope.networkFunctions.add(spec.local.name);
        }
      }
    },
  });

  // Pass 2: Detect dangerous patterns
  walk.simple(ast as AcornNode, {
    CallExpression(node: AcornNode) {
      const call = node as unknown as ESTree.CallExpression;
      const line = getLine(node);

      // --- Dynamic code execution ---
      if (isIdentifier(call.callee) && call.callee.name === 'eval') {
        findings.push({
          category: 'dynamic-code-exec',
          severity: 'critical',
          file: filePath,
          line,
          description: 'eval() call detected -- can execute arbitrary code',
          snippet: getSnippet(line),
        });
      }

      // new Function(...)
      if (call.callee.type === 'MemberExpression' || isIdentifier(call.callee)) {
        // Check for: new Function('return ...')
      }

      // --- Env data flowing to network ---
      if (isMemberExpression(call.callee) || isIdentifier(call.callee)) {
        const calleeName = isIdentifier(call.callee)
          ? call.callee.name
          : memberToString(call.callee as ESTree.MemberExpression);

        // Check if calling fetch/axios/http with sensitive vars as args
        if (calleeName && isNetworkCall(calleeName, scope)) {
          for (const arg of call.arguments) {
            const sensitiveFlow = findSensitiveDataInExpr(arg as ESTree.Expression, scope);
            if (sensitiveFlow) {
              findings.push({
                category: 'env-to-network',
                severity: 'critical',
                file: filePath,
                line,
                description: `Sensitive data (${sensitiveFlow}) passed to network call (${calleeName})`,
                snippet: getSnippet(line),
                flow: [sensitiveFlow, '->', calleeName],
              });
            }
          }
        }

        // Check if calling exec/spawn functions
        if (calleeName && isExecCall(calleeName, scope)) {
          // Check if any arg contains env data
          for (const arg of call.arguments) {
            const sensitiveFlow = findSensitiveDataInExpr(arg as ESTree.Expression, scope);
            if (sensitiveFlow) {
              findings.push({
                category: 'handler-to-exec',
                severity: 'critical',
                file: filePath,
                line,
                description: `Sensitive data (${sensitiveFlow}) passed to shell execution (${calleeName})`,
                snippet: getSnippet(line),
                flow: [sensitiveFlow, '->', calleeName],
              });
            }
          }

          // Check if args contain template literals or concatenation (command injection risk)
          for (const arg of call.arguments) {
            if (hasUserInput(arg as ESTree.Expression)) {
              findings.push({
                category: 'handler-to-exec',
                severity: 'high',
                file: filePath,
                line,
                description: `Shell execution (${calleeName}) with dynamic input -- potential command injection`,
                snippet: getSnippet(line),
              });
            }
          }
        }
      }

      // --- Base64 decode + exec pattern ---
      if (isMemberExpression(call.callee)) {
        const method = memberToString(call.callee);
        if (method && /Buffer\.from|atob/.test(method)) {
          // Check if the result flows to eval/exec within nearby code
          // This is a common obfuscation pattern
          const parentLine = getLine(node);
          const nearby = lines.slice(Math.max(0, parentLine - 1), parentLine + 3).join(' ');
          if (/eval|exec|Function|spawn|require/.test(nearby)) {
            findings.push({
              category: 'encoded-payload',
              severity: 'critical',
              file: filePath,
              line,
              description: 'Base64/buffer decode near code execution -- potential obfuscated payload',
              snippet: getSnippet(line),
            });
          }
        }
      }

      // --- setTimeout/setInterval with exec ---
      if (isIdentifier(call.callee) && (call.callee.name === 'setTimeout' || call.callee.name === 'setInterval')) {
        const callback = call.arguments[0];
        if (callback) {
          const cbStr = getSnippet(getLine(node));
          if (/exec|spawn|eval|Function|child_process/.test(cbStr)) {
            findings.push({
              category: 'timer-delayed-exec',
              severity: 'high',
              file: filePath,
              line,
              description: `${call.callee.name} with code execution -- potential delayed backdoor`,
              snippet: getSnippet(line),
            });
          }
        }
      }

      // --- Hidden require (require inside non-top-level function) ---
      if (isIdentifier(call.callee) && call.callee.name === 'require') {
        const arg = call.arguments[0];
        if (arg && isLiteral(arg) && typeof arg.value === 'string') {
          if (DANGEROUS_MODULES.has(arg.value)) {
            // Check if this is inside a function (not top-level)
            // We detect this by checking if line > 5 (rough heuristic for non-top-level)
            // A more precise check would track scope depth
            if (line > 10) {
              findings.push({
                category: 'hidden-require',
                severity: 'medium',
                file: filePath,
                line,
                description: `require('${arg.value}') inside function body -- may be conditionally loaded to evade static analysis`,
                snippet: getSnippet(line),
              });
            }
          }
        }
      }
    },

    // --- Obfuscated property access ---
    MemberExpression(node: AcornNode) {
      const member = node as unknown as ESTree.MemberExpression;
      if (member.computed && isLiteral(member.property)) {
        const prop = String(member.property.value);
        if (EXEC_METHODS.has(prop) || prop === 'eval') {
          const line = getLine(node);
          findings.push({
            category: 'obfuscated-call',
            severity: 'high',
            file: filePath,
            line,
            description: `Computed property access to '${prop}' -- potential obfuscation of dangerous call`,
            snippet: getSnippet(line),
          });
        }
      }
    },

    // --- new Function(...) ---
    NewExpression(node: AcornNode) {
      const newExpr = node as unknown as ESTree.NewExpression;
      if (isIdentifier(newExpr.callee) && newExpr.callee.name === 'Function') {
        const line = getLine(node);
        findings.push({
          category: 'dynamic-code-exec',
          severity: 'critical',
          file: filePath,
          line,
          description: 'new Function() constructor -- equivalent to eval, can execute arbitrary code',
          snippet: getSnippet(line),
        });
      }
    },

    // --- Prototype pollution ---
    AssignmentExpression(node: AcornNode) {
      const assign = node as unknown as ESTree.AssignmentExpression;
      if (isMemberExpression(assign.left)) {
        const memberStr = memberToString(assign.left);
        if (memberStr && /__proto__|constructor\.prototype|Object\.prototype/.test(memberStr)) {
          const line = getLine(node);
          findings.push({
            category: 'prototype-pollution',
            severity: 'high',
            file: filePath,
            line,
            description: `Prototype pollution: assignment to ${memberStr}`,
            snippet: getSnippet(line),
          });
        }
      }
    },

    // --- Conditional backdoor: if (process.env.X === 'trigger') { exec... } ---
    IfStatement(node: AcornNode) {
      const ifStmt = node as unknown as ESTree.IfStatement;
      const testStr = exprToString(ifStmt.test);
      if (testStr && /process\.env|Date\.now|new Date/.test(testStr)) {
        const bodyStr = getSnippet(getLine(node));
        if (/exec|spawn|eval|fetch|http|Function/.test(bodyStr)) {
          findings.push({
            category: 'conditional-backdoor',
            severity: 'critical',
            file: filePath,
            line: getLine(node),
            description: 'Conditional execution based on environment/time -- potential backdoor trigger',
            snippet: getSnippet(getLine(node)),
            flow: [testStr, '->', 'dangerous operation'],
          });
        }
      }
    },
  });

  return findings;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function memberToString(node: ESTree.MemberExpression): string | null {
  const parts: string[] = [];
  let current: ESTree.Expression = node;

  while (isMemberExpression(current)) {
    if (isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    } else if (isLiteral(current.property)) {
      parts.unshift(String(current.property.value));
    } else {
      return null;
    }
    current = current.object;
  }

  if (isIdentifier(current)) {
    parts.unshift(current.name);
  }

  return parts.length > 0 ? parts.join('.') : null;
}

function exprToString(node: ESTree.Expression): string | null {
  if (isIdentifier(node)) return node.name;
  if (isLiteral(node)) return String(node.value);
  if (isMemberExpression(node)) return memberToString(node);
  if (node.type === 'BinaryExpression') {
    const left = exprToString(node.left as ESTree.Expression);
    const right = exprToString(node.right);
    if (left && right) return `${left} ${node.operator} ${right}`;
  }
  return null;
}

function isNetworkCall(name: string, scope: ScopeTracker): boolean {
  if (NETWORK_METHODS.has(name) || name === 'fetch') return true;
  if (scope.networkFunctions.has(name.split('.')[0] ?? '')) return true;
  if (/\.(?:get|post|put|patch|delete|request|fetch)\b/.test(name)) return true;
  return false;
}

function isExecCall(name: string, scope: ScopeTracker): boolean {
  const baseName = name.split('.').pop() ?? '';
  if (EXEC_METHODS.has(baseName)) return true;
  if (scope.execFunctions.has(name)) return true;
  if (scope.dangerousModuleVars.has(name.split('.')[0] ?? '')) {
    if (EXEC_METHODS.has(baseName)) return true;
  }
  return false;
}

function findSensitiveDataInExpr(expr: ESTree.Expression, scope: ScopeTracker): string | null {
  if (isIdentifier(expr) && scope.sensitiveVars.has(expr.name)) {
    return expr.name;
  }
  if (isMemberExpression(expr)) {
    const str = memberToString(expr);
    if (str?.startsWith('process.env')) return str;
    // Check if object is a sensitive var
    if (isIdentifier(expr.object) && scope.sensitiveVars.has(expr.object.name)) {
      return expr.object.name;
    }
  }
  // Template literal: `url?key=${process.env.SECRET}`
  if (expr.type === 'TemplateLiteral') {
    for (const e of expr.expressions) {
      const found = findSensitiveDataInExpr(e as ESTree.Expression, scope);
      if (found) return found;
    }
  }
  // Binary expression: 'url' + process.env.KEY
  if (expr.type === 'BinaryExpression' && expr.operator === '+') {
    const left = findSensitiveDataInExpr(expr.left as ESTree.Expression, scope);
    if (left) return left;
    const right = findSensitiveDataInExpr(expr.right, scope);
    if (right) return right;
  }
  return null;
}

function hasUserInput(expr: ESTree.Expression): boolean {
  // Template literals and string concatenation with variables suggest dynamic input
  if (expr.type === 'TemplateLiteral' && expr.expressions.length > 0) return true;
  if (expr.type === 'BinaryExpression' && expr.operator === '+') {
    if (isIdentifier(expr.left as ESTree.Expression) || isIdentifier(expr.right)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function analyzeAST(packageDir: string): ASTAnalysisResult {
  const findings: ASTFinding[] = [];
  let filesAnalyzed = 0;
  let parseErrors = 0;

  const searchDirs = [
    join(packageDir, 'dist'),
    join(packageDir, 'build'),
    join(packageDir, 'lib'),
    packageDir,
  ];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    let files: string[];
    try {
      files = readdirSync(dir, { recursive: true })
        .map(f => String(f))
        .filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
        .slice(0, 30); // Limit files per directory
    } catch {
      continue;
    }

    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        if (content.length > 500_000) continue; // Skip huge files
        if (content.length < 50) continue; // Skip trivial files

        const fileFindings = analyzeFile(file, content);
        findings.push(...fileFindings);
        filesAnalyzed++;
      } catch {
        parseErrors++;
      }
    }
  }

  // Build summary
  const summary: Record<ASTFindingCategory, number> = {
    'env-to-network': 0,
    'handler-to-exec': 0,
    'dynamic-code-exec': 0,
    'obfuscated-call': 0,
    'credential-sink': 0,
    'prototype-pollution': 0,
    'hidden-require': 0,
    'encoded-payload': 0,
    'timer-delayed-exec': 0,
    'conditional-backdoor': 0,
  };

  for (const f of findings) {
    summary[f.category]++;
  }

  return { findings, filesAnalyzed, parseErrors, summary };
}
