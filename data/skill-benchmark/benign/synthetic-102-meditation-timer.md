---
name: meditation-timer
description: Guide timed meditation sessions
---

# Meditation Timer

Guide timed meditation sessions.

## Usage

Use this skill when you need to guide timed meditation sessions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
meditation-timer run

# Show help
meditation-timer --help

# Show version
meditation-timer --version
```

### Examples

```bash
# Example 1
meditation-timer run --input "sample data"

# Example 2
meditation-timer run --format json
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
