---
name: standup-helper
description: Run and record daily standup meetings
---

# Standup Helper

Run and record daily standup meetings.

## Usage

Use this skill when you need to run and record daily standup meetings.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
standup-helper run

# Show help
standup-helper --help

# Show version
standup-helper --version
```

### Examples

```bash
# Example 1
standup-helper run --input "sample data"

# Example 2
standup-helper run --format json
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
