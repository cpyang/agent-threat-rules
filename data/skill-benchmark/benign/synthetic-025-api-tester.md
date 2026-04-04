---
name: api-tester
description: Test REST API endpoints with assertions
---

# Api Tester

Test REST API endpoints with assertions.

## Usage

Use this skill when you need to test rest api endpoints with assertions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
api-tester run

# Show help
api-tester --help

# Show version
api-tester --version
```

### Examples

```bash
# Example 1
api-tester run --input "sample data"

# Example 2
api-tester run --format json
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
