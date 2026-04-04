---
name: responsive-helper
description: Test and debug responsive layouts
---

# Responsive Helper

Test and debug responsive layouts.

## Usage

Use this skill when you need to test and debug responsive layouts.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
responsive-helper run

# Show help
responsive-helper --help

# Show version
responsive-helper --version
```

### Examples

```bash
# Example 1
responsive-helper run --input "sample data"

# Example 2
responsive-helper run --format json
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
