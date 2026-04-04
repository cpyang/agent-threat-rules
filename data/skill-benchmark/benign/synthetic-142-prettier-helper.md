---
name: prettier-helper
description: Configure Prettier code formatting
---

# Prettier Helper

Configure Prettier code formatting.

## Usage

Use this skill when you need to configure prettier code formatting.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
prettier-helper run

# Show help
prettier-helper --help

# Show version
prettier-helper --version
```

### Examples

```bash
# Example 1
prettier-helper run --input "sample data"

# Example 2
prettier-helper run --format json
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
