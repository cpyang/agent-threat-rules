---
name: grammar-checker
description: Check grammar and suggest fixes
---

# Grammar Checker

Check grammar and suggest fixes.

## Usage

Use this skill when you need to check grammar and suggest fixes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
grammar-checker run

# Show help
grammar-checker --help

# Show version
grammar-checker --version
```

### Examples

```bash
# Example 1
grammar-checker run --input "sample data"

# Example 2
grammar-checker run --format json
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
