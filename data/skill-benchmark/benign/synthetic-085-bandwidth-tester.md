---
name: bandwidth-tester
description: Test network upload and download speed
---

# Bandwidth Tester

Test network upload and download speed.

## Usage

Use this skill when you need to test network upload and download speed.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
bandwidth-tester run

# Show help
bandwidth-tester --help

# Show version
bandwidth-tester --version
```

### Examples

```bash
# Example 1
bandwidth-tester run --input "sample data"

# Example 2
bandwidth-tester run --format json
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
