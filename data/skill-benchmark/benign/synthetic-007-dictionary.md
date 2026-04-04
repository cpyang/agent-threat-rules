---
name: dictionary
description: Look up word definitions and synonyms
---

# Dictionary

Look up word definitions and synonyms.

## Usage

Use this skill when you need to look up word definitions and synonyms.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
dictionary run

# Show help
dictionary --help

# Show version
dictionary --version
```

### Examples

```bash
# Example 1
dictionary run --input "sample data"

# Example 2
dictionary run --format json
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
