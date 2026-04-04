---
name: image-resizer
description: Resize and convert image files
---

# Image Resizer

Resize and convert image files.

## Usage

Use this skill when you need to resize and convert image files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
image-resizer run

# Show help
image-resizer --help

# Show version
image-resizer --version
```

### Examples

```bash
# Example 1
image-resizer run --input "sample data"

# Example 2
image-resizer run --format json
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
