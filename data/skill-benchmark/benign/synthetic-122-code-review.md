---
name: code-review
description: Assist with systematic code reviews
---

# Code Review

Assist with systematic code reviews.

## Usage

Use this skill when you need to assist with systematic code reviews.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
code-review run

# Show help
code-review --help

# Show version
code-review --version
```

### Examples

```bash
# Example 1
code-review run --input "sample data"

# Example 2
code-review run --format json
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
