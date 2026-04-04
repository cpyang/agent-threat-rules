---
name: theme-manager
description: Manage UI themes and color schemes
---

# Theme Manager

Manage UI themes and color schemes.

## Usage

Use this skill when you need to manage ui themes and color schemes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
theme-manager run

# Show help
theme-manager --help

# Show version
theme-manager --version
```

### Examples

```bash
# Example 1
theme-manager run --input "sample data"

# Example 2
theme-manager run --format json
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
