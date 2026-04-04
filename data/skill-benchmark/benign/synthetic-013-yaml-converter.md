---
name: yaml-converter
description: Convert between YAML and JSON formats
---

# Yaml Converter

Convert between YAML and JSON formats.

## Usage

Use this skill when you need to convert between yaml and json formats.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
yaml-converter run

# Show help
yaml-converter --help

# Show version
yaml-converter --version
```

### Examples

```bash
# Example 1
yaml-converter run --input "sample data"

# Example 2
yaml-converter run --format json
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
