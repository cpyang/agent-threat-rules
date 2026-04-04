---
name: snippet-manager
description: Manage reusable code snippets
---

# Snippet Manager

Manage reusable code snippets.

## Usage

Use this skill when you need to manage reusable code snippets.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
snippet-manager run

# Show help
snippet-manager --help

# Show version
snippet-manager --version
```

### Examples

```bash
# Example 1
snippet-manager run --input "sample data"

# Example 2
snippet-manager run --format json
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
