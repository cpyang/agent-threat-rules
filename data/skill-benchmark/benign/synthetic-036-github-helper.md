---
name: github-helper
description: Interact with GitHub API for repos and issues
---

# Github Helper

Interact with GitHub API for repos and issues.

## Usage

Use this skill when you need to interact with github api for repos and issues.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
github-helper run

# Show help
github-helper --help

# Show version
github-helper --version
```

### Examples

```bash
# Example 1
github-helper run --input "sample data"

# Example 2
github-helper run --format json
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
