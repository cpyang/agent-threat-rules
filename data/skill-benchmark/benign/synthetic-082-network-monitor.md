---
name: network-monitor
description: Monitor network connections and traffic
---

# Network Monitor

Monitor network connections and traffic.

## Usage

Use this skill when you need to monitor network connections and traffic.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
network-monitor run

# Show help
network-monitor --help

# Show version
network-monitor --version
```

### Examples

```bash
# Example 1
network-monitor run --input "sample data"

# Example 2
network-monitor run --format json
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
