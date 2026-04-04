---
name: load-tester
description: Run load and performance stress tests
---

# Load Tester

Run load and performance stress tests.

## Usage

Use this skill when you need to run load and performance stress tests.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
load-tester run

# Show help
load-tester --help

# Show version
load-tester --version
```

### Examples

```bash
# Example 1
load-tester run --input "sample data"

# Example 2
load-tester run --format json
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
