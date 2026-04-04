---
name: regex-tester
description: Test and debug regular expressions
---

# Regex Tester

Test and debug regular expressions.

## Usage

Use this skill when you need to test and debug regular expressions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
regex-tester run

# Show help
regex-tester --help

# Show version
regex-tester --version
```

### Examples

```bash
# Example 1
regex-tester run --input "sample data"

# Example 2
regex-tester run --format json
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
