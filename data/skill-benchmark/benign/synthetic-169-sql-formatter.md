---
name: sql-formatter
description: Format and beautify SQL queries
---

# Sql Formatter

Format and beautify SQL queries.

## Usage

Use this skill when you need to format and beautify sql queries.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sql-formatter run

# Show help
sql-formatter --help

# Show version
sql-formatter --version
```

### Examples

```bash
# Example 1
sql-formatter run --input "sample data"

# Example 2
sql-formatter run --format json
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
