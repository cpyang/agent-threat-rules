---
name: security-scanner
description: Scan code for security vulnerabilities
---

# Security Scanner

Scan code for security vulnerabilities.

## Usage

Use this skill when you need to scan code for security vulnerabilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
security-scanner run

# Show help
security-scanner --help

# Show version
security-scanner --version
```

### Examples

```bash
# Example 1
security-scanner run --input "sample data"

# Example 2
security-scanner run --format json
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
