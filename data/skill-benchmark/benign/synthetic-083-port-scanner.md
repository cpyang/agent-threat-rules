---
name: port-scanner
description: Scan open network ports on hosts
---

# Port Scanner

Scan open network ports on hosts.

## Usage

Use this skill when you need to scan open network ports on hosts.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
port-scanner run

# Show help
port-scanner --help

# Show version
port-scanner --version
```

### Examples

```bash
# Example 1
port-scanner run --input "sample data"

# Example 2
port-scanner run --format json
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
