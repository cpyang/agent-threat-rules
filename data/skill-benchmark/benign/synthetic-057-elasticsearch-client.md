---
name: elasticsearch-client
description: Search and index Elasticsearch data
---

# Elasticsearch Client

Search and index Elasticsearch data.

## Usage

Use this skill when you need to search and index elasticsearch data.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
elasticsearch-client run

# Show help
elasticsearch-client --help

# Show version
elasticsearch-client --version
```

### Examples

```bash
# Example 1
elasticsearch-client run --input "sample data"

# Example 2
elasticsearch-client run --format json
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
