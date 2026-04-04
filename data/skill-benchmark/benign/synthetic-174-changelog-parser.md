---
name: changelog-parser
description: Parse and query changelog entries
---

# Changelog Parser

Parse and query changelog entries.

## Usage

Use this skill when you need to parse and query changelog entries.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
changelog-parser run

# Show help
changelog-parser --help

# Show version
changelog-parser --version
```

### Examples

```bash
# Example 1
changelog-parser run --input "sample data"

# Example 2
changelog-parser run --format json
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
