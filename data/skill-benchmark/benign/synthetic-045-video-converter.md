---
name: video-converter
description: Convert video between formats
---

# Video Converter

Convert video between formats.

## Usage

Use this skill when you need to convert video between formats.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
video-converter run

# Show help
video-converter --help

# Show version
video-converter --version
```

### Examples

```bash
# Example 1
video-converter run --input "sample data"

# Example 2
video-converter run --format json
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
