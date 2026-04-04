---
name: csv-parser
description: Parse and transform CSV files
---

# Csv Parser

Parse and transform CSV files.

## Usage

Use this skill when you need to parse and transform csv files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
csv-parser run

# Show help
csv-parser --help

# Show version
csv-parser --version
```

### Examples

```bash
# Example 1
csv-parser run --input "sample data"

# Example 2
csv-parser run --format json
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
