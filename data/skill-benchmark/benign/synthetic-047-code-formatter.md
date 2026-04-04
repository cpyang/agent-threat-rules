---
name: code-formatter
description: Format code in multiple languages
---

# Code Formatter

Format code in multiple languages.

## Usage

Use this skill when you need to format code in multiple languages.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
code-formatter run

# Show help
code-formatter --help

# Show version
code-formatter --version
```

### Examples

```bash
# Example 1
code-formatter run --input "sample data"

# Example 2
code-formatter run --format json
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
