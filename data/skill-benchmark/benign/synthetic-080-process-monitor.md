---
name: process-monitor
description: Monitor system processes and resources
---

# Process Monitor

Monitor system processes and resources.

## Usage

Use this skill when you need to monitor system processes and resources.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
process-monitor run

# Show help
process-monitor --help

# Show version
process-monitor --version
```

### Examples

```bash
# Example 1
process-monitor run --input "sample data"

# Example 2
process-monitor run --format json
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
