---
name: jira-helper
description: Create and manage Jira issues and boards
---

# Jira Helper

Create and manage Jira issues and boards.

## Usage

Use this skill when you need to create and manage jira issues and boards.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
jira-helper run

# Show help
jira-helper --help

# Show version
jira-helper --version
```

### Examples

```bash
# Example 1
jira-helper run --input "sample data"

# Example 2
jira-helper run --format json
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
