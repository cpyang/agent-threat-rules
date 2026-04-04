---
name: semver-helper
description: Compare and validate semantic versions
---

# Semver Helper

Compare and validate semantic versions.

## Usage

Use this skill when you need to compare and validate semantic versions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
semver-helper run

# Show help
semver-helper --help

# Show version
semver-helper --version
```

### Examples

```bash
# Example 1
semver-helper run --input "sample data"

# Example 2
semver-helper run --format json
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
