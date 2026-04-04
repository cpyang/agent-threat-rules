---
name: graphql-client
description: Execute GraphQL queries and mutations
---

# Graphql Client

Execute GraphQL queries and mutations.

## Usage

Use this skill when you need to execute graphql queries and mutations.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
graphql-client run

# Show help
graphql-client --help

# Show version
graphql-client --version
```

### Examples

```bash
# Example 1
graphql-client run --input "sample data"

# Example 2
graphql-client run --format json
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
