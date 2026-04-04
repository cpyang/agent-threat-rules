---
name: ini-parser
description: Parse and edit INI configuration files
---

# Ini Parser

Parse and edit INI configuration files.

## Usage

Use this skill when you need to parse and edit ini configuration files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
ini-parser run

# Show help
ini-parser --help

# Show version
ini-parser --version
```

### Examples

```bash
# Example 1
ini-parser run --input "sample data"

# Example 2
ini-parser run --format json
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
