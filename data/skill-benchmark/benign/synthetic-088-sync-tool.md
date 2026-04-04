---
name: sync-tool
description: Synchronize files between locations
---

# Sync Tool

Synchronize files between locations.

## Usage

Use this skill when you need to synchronize files between locations.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sync-tool run

# Show help
sync-tool --help

# Show version
sync-tool --version
```

### Examples

```bash
# Example 1
sync-tool run --input "sample data"

# Example 2
sync-tool run --format json
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
