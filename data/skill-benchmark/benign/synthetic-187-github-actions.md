---
name: github-actions
description: GitHub Actions workflow helper
---

# Github Actions

GitHub Actions workflow helper.

## Usage

Use this skill when you need to github actions workflow helper.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
github-actions run

# Show help
github-actions --help

# Show version
github-actions --version
```

### Examples

```bash
# Example 1
github-actions run --input "sample data"

# Example 2
github-actions run --format json
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
