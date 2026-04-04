---
name: linter
description: Lint code for style and error detection
---

# Linter

Lint code for style and error detection.

## Usage

Use this skill when you need to lint code for style and error detection.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
linter run

# Show help
linter --help

# Show version
linter --version
```

### Examples

```bash
# Example 1
linter run --input "sample data"

# Example 2
linter run --format json
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
