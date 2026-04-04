---
name: git-helper
description: Advanced git operations and workflows
---

# Git Helper

Advanced git operations and workflows.

## Usage

Use this skill when you need to advanced git operations and workflows.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
git-helper run

# Show help
git-helper --help

# Show version
git-helper --version
```

### Examples

```bash
# Example 1
git-helper run --input "sample data"

# Example 2
git-helper run --format json
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
