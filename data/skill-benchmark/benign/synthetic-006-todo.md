---
name: todo
description: Manage to-do lists and task tracking
---

# Todo

Manage to-do lists and task tracking.

## Usage

Use this skill when you need to manage to-do lists and task tracking.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
todo run

# Show help
todo --help

# Show version
todo --version
```

### Examples

```bash
# Example 1
todo run --input "sample data"

# Example 2
todo run --format json
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
