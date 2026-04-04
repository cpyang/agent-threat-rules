---
name: a11y-checker
description: Check web accessibility WCAG compliance
---

# A11y Checker

Check web accessibility WCAG compliance.

## Usage

Use this skill when you need to check web accessibility wcag compliance.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
a11y-checker run

# Show help
a11y-checker --help

# Show version
a11y-checker --version
```

### Examples

```bash
# Example 1
a11y-checker run --input "sample data"

# Example 2
a11y-checker run --format json
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
