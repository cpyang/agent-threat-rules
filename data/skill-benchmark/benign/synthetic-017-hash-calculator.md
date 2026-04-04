---
name: hash-calculator
description: Calculate MD5 SHA256 and other hashes
---

# Hash Calculator

Calculate MD5 SHA256 and other hashes.

## Usage

Use this skill when you need to calculate md5 sha256 and other hashes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
hash-calculator run

# Show help
hash-calculator --help

# Show version
hash-calculator --version
```

### Examples

```bash
# Example 1
hash-calculator run --input "sample data"

# Example 2
hash-calculator run --format json
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
