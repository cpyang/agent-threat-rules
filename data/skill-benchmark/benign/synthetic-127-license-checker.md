---
name: license-checker
description: Check and verify open source licenses
---

# License Checker

Check and verify open source licenses.

## Usage

Use this skill when you need to check and verify open source licenses.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
license-checker run

# Show help
license-checker --help

# Show version
license-checker --version
```

### Examples

```bash
# Example 1
license-checker run --input "sample data"

# Example 2
license-checker run --format json
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
