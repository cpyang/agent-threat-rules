---
name: cron-parser
description: Parse and explain cron expressions
---

# Cron Parser

Parse and explain cron expressions.

## Usage

Use this skill when you need to parse and explain cron expressions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cron-parser run

# Show help
cron-parser --help

# Show version
cron-parser --version
```

### Examples

```bash
# Example 1
cron-parser run --input "sample data"

# Example 2
cron-parser run --format json
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
