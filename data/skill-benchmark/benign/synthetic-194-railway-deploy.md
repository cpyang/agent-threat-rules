---
name: railway-deploy
description: Railway app deployment helper
---

# Railway Deploy

Railway app deployment helper.

## Usage

Use this skill when you need to railway app deployment helper.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
railway-deploy run

# Show help
railway-deploy --help

# Show version
railway-deploy --version
```

### Examples

```bash
# Example 1
railway-deploy run --input "sample data"

# Example 2
railway-deploy run --format json
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
