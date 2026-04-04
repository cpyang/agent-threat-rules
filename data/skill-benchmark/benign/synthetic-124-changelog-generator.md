---
name: changelog-generator
description: Generate changelogs from git commits
---

# Changelog Generator

Generate changelogs from git commits.

## Usage

Use this skill when you need to generate changelogs from git commits.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
changelog-generator run

# Show help
changelog-generator --help

# Show version
changelog-generator --version
```

### Examples

```bash
# Example 1
changelog-generator run --input "sample data"

# Example 2
changelog-generator run --format json
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
