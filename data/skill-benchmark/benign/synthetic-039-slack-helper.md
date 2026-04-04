---
name: slack-helper
description: Send messages and manage Slack channels
---

# Slack Helper

Send messages and manage Slack channels.

## Usage

Use this skill when you need to send messages and manage slack channels.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
slack-helper run

# Show help
slack-helper --help

# Show version
slack-helper --version
```

### Examples

```bash
# Example 1
slack-helper run --input "sample data"

# Example 2
slack-helper run --format json
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
