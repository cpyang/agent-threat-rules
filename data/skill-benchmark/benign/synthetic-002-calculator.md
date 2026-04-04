---
name: calculator
description: Perform mathematical calculations and unit conversions
---

# Calculator

Perform mathematical calculations and unit conversions.

## Usage

Use this skill when you need to perform mathematical calculations and unit conversions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
calculator run

# Show help
calculator --help

# Show version
calculator --version
```

### Examples

```bash
# Example 1
calculator run --input "sample data"

# Example 2
calculator run --format json
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
