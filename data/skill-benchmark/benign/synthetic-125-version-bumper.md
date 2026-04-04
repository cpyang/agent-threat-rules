---
name: version-bumper
description: Bump semantic version numbers
---

# Version Bumper

Bump semantic version numbers.

## Usage

Use this skill when you need to bump semantic version numbers.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
version-bumper run

# Show help
version-bumper --help

# Show version
version-bumper --version
```

### Examples

```bash
# Example 1
version-bumper run --input "sample data"

# Example 2
version-bumper run --format json
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
