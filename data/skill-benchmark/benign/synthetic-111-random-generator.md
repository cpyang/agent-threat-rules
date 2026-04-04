---
name: random-generator
description: Generate random numbers strings and data
---

# Random Generator

Generate random numbers strings and data.

## Usage

Use this skill when you need to generate random numbers strings and data.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
random-generator run

# Show help
random-generator --help

# Show version
random-generator --version
```

### Examples

```bash
# Example 1
random-generator run --input "sample data"

# Example 2
random-generator run --format json
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
