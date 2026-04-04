---
name: test-runner
description: Run and report test results
---

# Test Runner

Run and report test results.

## Usage

Use this skill when you need to run and report test results.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
test-runner run

# Show help
test-runner --help

# Show version
test-runner --version
```

### Examples

```bash
# Example 1
test-runner run --input "sample data"

# Example 2
test-runner run --format json
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
