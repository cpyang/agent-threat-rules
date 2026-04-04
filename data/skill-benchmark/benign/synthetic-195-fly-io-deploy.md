---
name: fly-io-deploy
description: Fly.io application deployment
---

# Fly Io Deploy

Fly.io application deployment.

## Usage

Use this skill when you need to fly.io application deployment.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
fly-io-deploy run

# Show help
fly-io-deploy --help

# Show version
fly-io-deploy --version
```

### Examples

```bash
# Example 1
fly-io-deploy run --input "sample data"

# Example 2
fly-io-deploy run --format json
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
