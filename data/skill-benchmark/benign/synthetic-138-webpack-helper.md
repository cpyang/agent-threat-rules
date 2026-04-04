---
name: webpack-helper
description: Configure and optimize webpack builds
---

# Webpack Helper

Configure and optimize webpack builds.

## Usage

Use this skill when you need to configure and optimize webpack builds.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
webpack-helper run

# Show help
webpack-helper --help

# Show version
webpack-helper --version
```

### Examples

```bash
# Example 1
webpack-helper run --input "sample data"

# Example 2
webpack-helper run --format json
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
