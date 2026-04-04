---
name: cors-helper
description: Debug and configure CORS settings
---

# Cors Helper

Debug and configure CORS settings.

## Usage

Use this skill when you need to debug and configure cors settings.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cors-helper run

# Show help
cors-helper --help

# Show version
cors-helper --version
```

### Examples

```bash
# Example 1
cors-helper run --input "sample data"

# Example 2
cors-helper run --format json
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
