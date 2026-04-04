---
name: compression-tool
description: Compress and extract archive files
---

# Compression Tool

Compress and extract archive files.

## Usage

Use this skill when you need to compress and extract archive files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
compression-tool run

# Show help
compression-tool --help

# Show version
compression-tool --version
```

### Examples

```bash
# Example 1
compression-tool run --input "sample data"

# Example 2
compression-tool run --format json
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
