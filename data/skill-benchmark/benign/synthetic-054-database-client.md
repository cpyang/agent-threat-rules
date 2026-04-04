---
name: database-client
description: Connect and query SQL databases
---

# Database Client

Connect and query SQL databases.

## Usage

Use this skill when you need to connect and query sql databases.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
database-client run

# Show help
database-client --help

# Show version
database-client --version
```

### Examples

```bash
# Example 1
database-client run --input "sample data"

# Example 2
database-client run --format json
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
