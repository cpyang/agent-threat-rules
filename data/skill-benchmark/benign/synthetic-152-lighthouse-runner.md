---
name: lighthouse-runner
description: Run Google Lighthouse performance audits
---

# Lighthouse Runner

Run Google Lighthouse performance audits.

## Usage

Use this skill when you need to run google lighthouse performance audits.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
lighthouse-runner run

# Show help
lighthouse-runner --help

# Show version
lighthouse-runner --version
```

### Examples

```bash
# Example 1
lighthouse-runner run --input "sample data"

# Example 2
lighthouse-runner run --format json
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
