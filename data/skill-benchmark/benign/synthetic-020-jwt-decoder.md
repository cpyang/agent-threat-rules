---
name: jwt-decoder
description: Decode and inspect JWT tokens
---

# Jwt Decoder

Decode and inspect JWT tokens.

## Usage

Use this skill when you need to decode and inspect jwt tokens.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
jwt-decoder run

# Show help
jwt-decoder --help

# Show version
jwt-decoder --version
```

### Examples

```bash
# Example 1
jwt-decoder run --input "sample data"

# Example 2
jwt-decoder run --format json
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
