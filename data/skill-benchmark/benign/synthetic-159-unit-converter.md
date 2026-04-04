---
name: unit-converter
description: Convert between measurement units
---

# Unit Converter

Convert between measurement units.

## Usage

Use this skill when you need to convert between measurement units.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
unit-converter run

# Show help
unit-converter --help

# Show version
unit-converter --version
```

### Examples

```bash
# Example 1
unit-converter run --input "sample data"

# Example 2
unit-converter run --format json
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
