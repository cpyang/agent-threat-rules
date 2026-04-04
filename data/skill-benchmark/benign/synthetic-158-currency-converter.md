---
name: currency-converter
description: Convert between world currencies
---

# Currency Converter

Convert between world currencies.

## Usage

Use this skill when you need to convert between world currencies.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
currency-converter run

# Show help
currency-converter --help

# Show version
currency-converter --version
```

### Examples

```bash
# Example 1
currency-converter run --input "sample data"

# Example 2
currency-converter run --format json
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
