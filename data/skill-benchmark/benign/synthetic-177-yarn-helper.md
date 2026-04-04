---
name: yarn-helper
description: Yarn package management utilities
---

# Yarn Helper

Yarn package management utilities.

## Usage

Use this skill when you need to yarn package management utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
yarn-helper run

# Show help
yarn-helper --help

# Show version
yarn-helper --version
```

### Examples

```bash
# Example 1
yarn-helper run --input "sample data"

# Example 2
yarn-helper run --format json
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
