---
name: discord-helper
description: Interact with Discord servers and channels
---

# Discord Helper

Interact with Discord servers and channels.

## Usage

Use this skill when you need to interact with discord servers and channels.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
discord-helper run

# Show help
discord-helper --help

# Show version
discord-helper --version
```

### Examples

```bash
# Example 1
discord-helper run --input "sample data"

# Example 2
discord-helper run --format json
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
