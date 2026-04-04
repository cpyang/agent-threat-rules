---
name: text-to-speech
description: Convert text to spoken audio
---

# Text To Speech

Convert text to spoken audio.

## Usage

Use this skill when you need to convert text to spoken audio.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
text-to-speech run

# Show help
text-to-speech --help

# Show version
text-to-speech --version
```

### Examples

```bash
# Example 1
text-to-speech run --input "sample data"

# Example 2
text-to-speech run --format json
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
