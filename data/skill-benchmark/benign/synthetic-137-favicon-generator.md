---
name: favicon-generator
description: Generate favicons from images
---

# Favicon Generator

Generate favicons from images.

## Usage

Use this skill when you need to generate favicons from images.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
favicon-generator run

# Show help
favicon-generator --help

# Show version
favicon-generator --version
```

### Examples

```bash
# Example 1
favicon-generator run --input "sample data"

# Example 2
favicon-generator run --format json
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
