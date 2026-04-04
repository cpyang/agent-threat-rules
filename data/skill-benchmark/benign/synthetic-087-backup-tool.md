---
name: backup-tool
description: Create and restore file backups
---

# Backup Tool

Create and restore file backups.

## Usage

Use this skill when you need to create and restore file backups.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
backup-tool run

# Show help
backup-tool --help

# Show version
backup-tool --version
```

### Examples

```bash
# Example 1
backup-tool run --input "sample data"

# Example 2
backup-tool run --format json
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
