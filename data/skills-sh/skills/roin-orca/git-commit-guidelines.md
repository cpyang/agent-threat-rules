---
name: git-commit-guidelines
description: Git commit message best practices. Use when writing commit messages, reviewing commits, or setting up commit conventions for a project. Ensures clear, consistent, and useful commit history.
license: MIT
metadata:
  author: roin-orca
  version: "1.0.0"
---

# Git Commit Guidelines

Best practices for writing clear, consistent git commit messages.

## When to Apply

Reference these guidelines when:
- Writing commit messages
- Reviewing pull requests for commit quality
- Setting up commit conventions for a new project

## Rules

| Rule | Summary |
|------|---------|
| `structure` | Use subject line + blank line + body format |
| `subject-line` | Keep subject under 72 chars, imperative mood, no trailing period |
| `body` | Explain what and why, not how |
| `scope` | One logical change per commit |

## Quick Reference

### Structure
Every commit message should have a short subject line. For non-trivial changes, follow with a blank line and a body that explains context.

### Subject Line
- Use imperative mood: "Add feature" not "Added feature"
- Keep under 72 characters
- Capitalize the first word
- Do not end with a period

### Body
- Wrap at 72 characters
- Explain *what* changed and *why*, not *how*
- Reference issue numbers when applicable

### Scope
- Each commit should represent one logical change
- Separate refactoring from behavior changes
- Separate whitespace/formatting fixes from functional changes
