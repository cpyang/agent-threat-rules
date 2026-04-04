---
name: pr-template
description: Generate pull request description templates
---

# Pr Template

Generate pull request description templates.

## Usage

Use this skill when you need to generate pull request description templates.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
pr-template run

# Show help
pr-template --help

# Show version
pr-template --version
```

### Examples

```bash
# Example 1
pr-template run --input "sample data"

# Example 2
pr-template run --format json
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
