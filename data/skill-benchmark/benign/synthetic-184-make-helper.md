---
name: make-helper
description: GNU Make and Makefile utilities
---

# Make Helper

GNU Make and Makefile utilities.

## Usage

Use this skill when you need to gnu make and makefile utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
make-helper run

# Show help
make-helper --help

# Show version
make-helper --version
```

### Examples

```bash
# Example 1
make-helper run --input "sample data"

# Example 2
make-helper run --format json
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
