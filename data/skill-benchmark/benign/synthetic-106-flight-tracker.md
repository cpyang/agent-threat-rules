---
name: flight-tracker
description: Track real-time flight status
---

# Flight Tracker

Track real-time flight status.

## Usage

Use this skill when you need to track real-time flight status.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
flight-tracker run

# Show help
flight-tracker --help

# Show version
flight-tracker --version
```

### Examples

```bash
# Example 1
flight-tracker run --input "sample data"

# Example 2
flight-tracker run --format json
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
