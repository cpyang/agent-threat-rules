---
name: cloudflare-helper
description: Cloudflare Workers and Pages helper
---

# Cloudflare Helper

Cloudflare Workers and Pages helper.

## Usage

Use this skill when you need to cloudflare workers and pages helper.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cloudflare-helper run

# Show help
cloudflare-helper --help

# Show version
cloudflare-helper --version
```

### Examples

```bash
# Example 1
cloudflare-helper run --input "sample data"

# Example 2
cloudflare-helper run --format json
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
