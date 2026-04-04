---
name: color-picker
description: Convert between color formats hex rgb hsl
---

# Color Picker

Convert between color formats hex rgb hsl.

## Usage

Use this skill when you need to convert between color formats hex rgb hsl.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
color-picker run

# Show help
color-picker --help

# Show version
color-picker --version
```

### Examples

```bash
# Example 1
color-picker run --input "sample data"

# Example 2
color-picker run --format json
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
