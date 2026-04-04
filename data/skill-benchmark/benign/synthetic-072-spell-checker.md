---
name: spell-checker
description: Check and correct spelling errors
---

# Spell Checker

Check and correct spelling errors.

## Usage

Use this skill when you need to check and correct spelling errors.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
spell-checker run

# Show help
spell-checker --help

# Show version
spell-checker --version
```

### Examples

```bash
# Example 1
spell-checker run --input "sample data"

# Example 2
spell-checker run --format json
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
