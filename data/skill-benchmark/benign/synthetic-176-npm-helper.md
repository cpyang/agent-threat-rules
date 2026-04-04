---
name: npm-helper
description: NPM package management utilities
---

# Npm Helper

NPM package management utilities.

## Usage

Use this skill when you need to npm package management utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
npm-helper run

# Show help
npm-helper --help

# Show version
npm-helper --version
```

### Examples

```bash
# Example 1
npm-helper run --input "sample data"

# Example 2
npm-helper run --format json
```

## Configuration

Configure via environment variables or a local config file:

```json
{
  "output": "json",
  "verbose": false,
  "timeout": 30
}
```

## Notes

- Follows best practices for the domain
- No external binary dependencies required
- Works offline without network access
- All data stays local on your machine
