---
name: screen-recorder
description: Record screen activity
---

# Screen Recorder

Record screen activity.

## Usage

Use this skill when you need to record screen activity.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
screen-recorder run

# Show help
screen-recorder --help

# Show version
screen-recorder --version
```

### Examples

```bash
# Example 1
screen-recorder run --input "sample data"

# Example 2
screen-recorder run --format json
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
