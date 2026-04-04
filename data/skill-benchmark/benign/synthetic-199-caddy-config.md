---
name: caddy-config
description: Caddy web server configuration
---

# Caddy Config

Caddy web server configuration.

## Usage

Use this skill when you need to caddy web server configuration.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
caddy-config run

# Show help
caddy-config --help

# Show version
caddy-config --version
```

### Examples

```bash
# Example 1
caddy-config run --input "sample data"

# Example 2
caddy-config run --format json
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
