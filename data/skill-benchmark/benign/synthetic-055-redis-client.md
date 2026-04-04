---
name: redis-client
description: Interact with Redis key-value store
---

# Redis Client

Interact with Redis key-value store.

## Usage

Use this skill when you need to interact with redis key-value store.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
redis-client run

# Show help
redis-client --help

# Show version
redis-client --version
```

### Examples

```bash
# Example 1
redis-client run --input "sample data"

# Example 2
redis-client run --format json
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
