---
name: dotenv-checker
description: Validate dotenv file format and keys
---

# Dotenv Checker

Validate dotenv file format and keys.

## Usage

Use this skill when you need to validate dotenv file format and keys.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
dotenv-checker run

# Show help
dotenv-checker --help

# Show version
dotenv-checker --version
```

### Examples

```bash
# Example 1
dotenv-checker run --input "sample data"

# Example 2
dotenv-checker run --format json
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
