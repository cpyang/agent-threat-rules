---
name: retrospective
description: Run structured team retrospectives
---

# Retrospective

Run structured team retrospectives.

## Usage

Use this skill when you need to run structured team retrospectives.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
retrospective run

# Show help
retrospective --help

# Show version
retrospective --version
```

### Examples

```bash
# Example 1
retrospective run --input "sample data"

# Example 2
retrospective run --format json
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
