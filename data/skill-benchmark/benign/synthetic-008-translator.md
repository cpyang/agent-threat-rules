---
name: translator
description: Translate text between languages
---

# Translator

Translate text between languages.

## Usage

Use this skill when you need to translate text between languages.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
translator run

# Show help
translator --help

# Show version
translator --version
```

### Examples

```bash
# Example 1
translator run --input "sample data"

# Example 2
translator run --format json
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
