---
name: netlify-deploy
description: Netlify deployment configuration
---

# Netlify Deploy

Netlify deployment configuration.

## Usage

Use this skill when you need to netlify deployment configuration.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
netlify-deploy run

# Show help
netlify-deploy --help

# Show version
netlify-deploy --version
```

### Examples

```bash
# Example 1
netlify-deploy run --input "sample data"

# Example 2
netlify-deploy run --format json
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
