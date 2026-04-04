---
name: password-generator
description: Generate secure random passwords
---

# Password Generator

Generate secure random passwords.

## Usage

Use this skill when you need to generate secure random passwords.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
password-generator run

# Show help
password-generator --help

# Show version
password-generator --version
```

### Examples

```bash
# Example 1
password-generator run --input "sample data"

# Example 2
password-generator run --format json
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
