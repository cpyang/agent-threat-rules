---
name: base64-tool
description: Encode and decode base64 strings
---

# Base64 Tool

Encode and decode base64 strings.

## Usage

Use this skill when you need to encode and decode base64 strings.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
base64-tool run

# Show help
base64-tool --help

# Show version
base64-tool --version
```

### Examples

```bash
# Example 1
base64-tool run --input "sample data"

# Example 2
base64-tool run --format json
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
