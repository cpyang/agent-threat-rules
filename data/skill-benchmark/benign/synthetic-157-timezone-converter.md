---
name: timezone-converter
description: Convert times between timezones
---

# Timezone Converter

Convert times between timezones.

## Usage

Use this skill when you need to convert times between timezones.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
timezone-converter run

# Show help
timezone-converter --help

# Show version
timezone-converter --version
```

### Examples

```bash
# Example 1
timezone-converter run --input "sample data"

# Example 2
timezone-converter run --format json
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
