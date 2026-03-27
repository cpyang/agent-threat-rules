#!/usr/bin/env bash
# release.sh — One-command release for ATR
#
# Usage: ./scripts/release.sh [patch|minor|major]
#   Default: patch (0.4.0 → 0.4.1)
#
# What it does:
#   1. Runs tests + eval
#   2. Bumps version in package.json
#   3. Builds
#   4. Commits + tags + pushes
#   5. Publishes to npm
#   6. Verifies npm install

set -euo pipefail

BUMP_TYPE="${1:-patch}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Preflight checks ────────────────────────────────────
echo "=== Preflight ==="

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is dirty. Commit or stash changes first."
  exit 1
fi

npm whoami >/dev/null 2>&1 || { echo "ERROR: Not logged in to npm. Run: npm login"; exit 1; }

echo "Running tests..."
npm test || { echo "ERROR: Tests failed."; exit 1; }

echo "Running eval..."
npm run eval || { echo "ERROR: Eval failed."; exit 1; }

# ── Read current version ─────────────────────────────────
CURRENT=$(node -e "console.log(require('./package.json').version)")
echo "Current version: $CURRENT"

# ── Calculate new version ────────────────────────────────
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "ERROR: Invalid bump type '$BUMP_TYPE'. Use patch|minor|major."; exit 1 ;;
esac
NEW="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW"

# ── Bump version ──────────────────────────────────────────
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  p.version = '$NEW';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"
echo "  package.json → $NEW"

# ── Build ─────────────────────────────────────────────────
echo "Building..."
npm run build

# ── Commit + tag + push ──────────────────────────────────
echo "=== Releasing ==="
git add package.json
git commit -m "release: v$NEW"
git tag "v$NEW"
git push origin main
git push origin "v$NEW"

# ── Publish to npm ────────────────────────────────────────
echo "Publishing to npm..."
npm publish --access public

# ── Verify ────────────────────────────────────────────────
echo ""
echo "=== Verifying ==="
sleep 5  # wait for npm registry to propagate

PUBLISHED=$(npm info agent-threat-rules version 2>/dev/null || echo "unknown")
if [ "$PUBLISHED" = "$NEW" ]; then
  echo "npm registry: v$PUBLISHED"
else
  echo "WARNING: npm shows v$PUBLISHED, expected v$NEW (may need a few minutes to propagate)"
fi

echo ""
echo "======================================="
echo "  ATR v$NEW released!"
echo "======================================="
echo ""
echo "Verify install:"
echo "  npm install -g agent-threat-rules && atr --version"
echo ""
echo "If PanGuard needs this update, run:"
echo "  cd ~/Downloads/panguard-ai"
echo "  rsync -av --delete ~/Downloads/agent-threat-rules/rules/ packages/atr/rules/"
echo "  # Then update packages/atr/package.json version to $NEW"
echo "  # Then: ./scripts/release.sh patch"
echo ""
