---
name: pnpm-helper
description: PNPM package management utilities
---

# Pnpm Helper

PNPM package management utilities.

## Usage

Use this skill when you need to pnpm package management utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
pnpm-helper run

# Show help
pnpm-helper --help

# Show version
pnpm-helper --version
```

### Examples

```bash
# Example 1
pnpm-helper run --input "sample data"

# Example 2
pnpm-helper run --format json
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
