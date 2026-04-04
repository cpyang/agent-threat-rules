---
name: screenshot-tool
description: Capture and annotate screenshots
---

# Screenshot Tool

Capture and annotate screenshots.

## Usage

Use this skill when you need to capture and annotate screenshots.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
screenshot-tool run

# Show help
screenshot-tool --help

# Show version
screenshot-tool --version
```

### Examples

```bash
# Example 1
screenshot-tool run --input "sample data"

# Example 2
screenshot-tool run --format json
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
