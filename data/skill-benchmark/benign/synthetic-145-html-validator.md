---
name: html-validator
description: Validate HTML markup against standards
---

# Html Validator

Validate HTML markup against standards.

## Usage

Use this skill when you need to validate html markup against standards.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
html-validator run

# Show help
html-validator --help

# Show version
html-validator --version
```

### Examples

```bash
# Example 1
html-validator run --input "sample data"

# Example 2
html-validator run --format json
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
