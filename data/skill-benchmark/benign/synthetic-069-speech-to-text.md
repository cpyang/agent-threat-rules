---
name: speech-to-text
description: Convert spoken audio to text
---

# Speech To Text

Convert spoken audio to text.

## Usage

Use this skill when you need to convert spoken audio to text.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
speech-to-text run

# Show help
speech-to-text --help

# Show version
speech-to-text --version
```

### Examples

```bash
# Example 1
speech-to-text run --input "sample data"

# Example 2
speech-to-text run --format json
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
