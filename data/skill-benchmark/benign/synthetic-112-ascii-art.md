---
name: ascii-art
description: Generate ASCII art from text input
---

# Ascii Art

Generate ASCII art from text input.

## Usage

Use this skill when you need to generate ascii art from text input.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
ascii-art run

# Show help
ascii-art --help

# Show version
ascii-art --version
```

### Examples

```bash
# Example 1
ascii-art run --input "sample data"

# Example 2
ascii-art run --format json
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
