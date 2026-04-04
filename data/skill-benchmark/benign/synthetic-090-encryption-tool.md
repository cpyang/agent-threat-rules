---
name: encryption-tool
description: Encrypt and decrypt files securely
---

# Encryption Tool

Encrypt and decrypt files securely.

## Usage

Use this skill when you need to encrypt and decrypt files securely.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
encryption-tool run

# Show help
encryption-tool --help

# Show version
encryption-tool --version
```

### Examples

```bash
# Example 1
encryption-tool run --input "sample data"

# Example 2
encryption-tool run --format json
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
