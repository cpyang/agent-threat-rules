---
name: date-helper
description: Parse format and manipulate dates
---

# Date Helper

Parse format and manipulate dates.

## Usage

Use this skill when you need to parse format and manipulate dates.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
date-helper run

# Show help
date-helper --help

# Show version
date-helper --version
```

### Examples

```bash
# Example 1
date-helper run --input "sample data"

# Example 2
date-helper run --format json
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
