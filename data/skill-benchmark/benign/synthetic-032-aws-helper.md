---
name: aws-helper
description: Interact with AWS services
---

# Aws Helper

Interact with AWS services.

## Usage

Use this skill when you need to interact with aws services.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
aws-helper run

# Show help
aws-helper --help

# Show version
aws-helper --version
```

### Examples

```bash
# Example 1
aws-helper run --input "sample data"

# Example 2
aws-helper run --format json
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
