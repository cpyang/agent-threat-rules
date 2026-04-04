---
name: disk-usage
description: Analyze and visualize disk space usage
---

# Disk Usage

Analyze and visualize disk space usage.

## Usage

Use this skill when you need to analyze and visualize disk space usage.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
disk-usage run

# Show help
disk-usage --help

# Show version
disk-usage --version
```

### Examples

```bash
# Example 1
disk-usage run --input "sample data"

# Example 2
disk-usage run --format json
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
