---
name: cpu-monitor
description: Monitor CPU usage and temperature
---

# Cpu Monitor

Monitor CPU usage and temperature.

## Usage

Use this skill when you need to monitor cpu usage and temperature.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cpu-monitor run

# Show help
cpu-monitor --help

# Show version
cpu-monitor --version
```

### Examples

```bash
# Example 1
cpu-monitor run --input "sample data"

# Example 2
cpu-monitor run --format json
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
