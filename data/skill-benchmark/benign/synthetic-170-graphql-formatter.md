---
name: graphql-formatter
description: Format GraphQL queries and schemas
---

# Graphql Formatter

Format GraphQL queries and schemas.

## Usage

Use this skill when you need to format graphql queries and schemas.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
graphql-formatter run

# Show help
graphql-formatter --help

# Show version
graphql-formatter --version
```

### Examples

```bash
# Example 1
graphql-formatter run --input "sample data"

# Example 2
graphql-formatter run --format json
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
