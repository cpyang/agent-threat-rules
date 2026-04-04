---
name: weather
description: Get current weather and forecasts for any location
---

# Weather

Get current weather and forecasts for any location.

## Usage

Use this skill when you need to get current weather and forecasts for any location.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
weather run

# Show help
weather --help

# Show version
weather --version
```

### Examples

```bash
# Example 1
weather run --input "sample data"

# Example 2
weather run --format json
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
