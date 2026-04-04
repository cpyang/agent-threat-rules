---
name: mongodb-client
description: Query and manage MongoDB collections
---

# Mongodb Client

Query and manage MongoDB collections.

## Usage

Use this skill when you need to query and manage mongodb collections.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
mongodb-client run

# Show help
mongodb-client --help

# Show version
mongodb-client --version
```

### Examples

```bash
# Example 1
mongodb-client run --input "sample data"

# Example 2
mongodb-client run --format json
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
