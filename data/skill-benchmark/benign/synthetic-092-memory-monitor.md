---
name: memory-monitor
description: Monitor RAM and swap memory usage
---

# Memory Monitor

Monitor RAM and swap memory usage.

## Usage

Use this skill when you need to monitor ram and swap memory usage.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
memory-monitor run

# Show help
memory-monitor --help

# Show version
memory-monitor --version
```

### Examples

```bash
# Example 1
memory-monitor run --input "sample data"

# Example 2
memory-monitor run --format json
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
