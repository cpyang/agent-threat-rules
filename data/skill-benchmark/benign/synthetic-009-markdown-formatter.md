---
name: markdown-formatter
description: Convert and format markdown documents
---

# Markdown Formatter

Convert and format markdown documents.

## Usage

Use this skill when you need to convert and format markdown documents.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
markdown-formatter run

# Show help
markdown-formatter --help

# Show version
markdown-formatter --version
```

### Examples

```bash
# Example 1
markdown-formatter run --input "sample data"

# Example 2
markdown-formatter run --format json
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
