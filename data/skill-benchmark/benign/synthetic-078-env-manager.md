---
name: env-manager
description: Manage environment variables safely
---

# Env Manager

Manage environment variables safely.

## Usage

Use this skill when you need to manage environment variables safely.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
env-manager run

# Show help
env-manager --help

# Show version
env-manager --version
```

### Examples

```bash
# Example 1
env-manager run --input "sample data"

# Example 2
env-manager run --format json
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
