---
name: coverage-reporter
description: Generate code coverage reports
---

# Coverage Reporter

Generate code coverage reports.

## Usage

Use this skill when you need to generate code coverage reports.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
coverage-reporter run

# Show help
coverage-reporter --help

# Show version
coverage-reporter --version
```

### Examples

```bash
# Example 1
coverage-reporter run --input "sample data"

# Example 2
coverage-reporter run --format json
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
