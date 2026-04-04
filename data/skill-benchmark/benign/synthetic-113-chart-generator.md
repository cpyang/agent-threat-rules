---
name: chart-generator
description: Generate charts and graphs from data
---

# Chart Generator

Generate charts and graphs from data.

## Usage

Use this skill when you need to generate charts and graphs from data.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
chart-generator run

# Show help
chart-generator --help

# Show version
chart-generator --version
```

### Examples

```bash
# Example 1
chart-generator run --input "sample data"

# Example 2
chart-generator run --format json
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
