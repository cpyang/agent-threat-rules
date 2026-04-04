---
name: svg-optimizer
description: Optimize and minify SVG files
---

# Svg Optimizer

Optimize and minify SVG files.

## Usage

Use this skill when you need to optimize and minify svg files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
svg-optimizer run

# Show help
svg-optimizer --help

# Show version
svg-optimizer --version
```

### Examples

```bash
# Example 1
svg-optimizer run --input "sample data"

# Example 2
svg-optimizer run --format json
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
