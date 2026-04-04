---
name: eslint-helper
description: Configure ESLint rules and fix issues
---

# Eslint Helper

Configure ESLint rules and fix issues.

## Usage

Use this skill when you need to configure eslint rules and fix issues.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
eslint-helper run

# Show help
eslint-helper --help

# Show version
eslint-helper --version
```

### Examples

```bash
# Example 1
eslint-helper run --input "sample data"

# Example 2
eslint-helper run --format json
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
