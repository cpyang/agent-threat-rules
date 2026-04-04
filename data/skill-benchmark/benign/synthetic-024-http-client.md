---
name: http-client
description: Make HTTP requests and inspect responses
---

# Http Client

Make HTTP requests and inspect responses.

## Usage

Use this skill when you need to make http requests and inspect responses.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
http-client run

# Show help
http-client --help

# Show version
http-client --version
```

### Examples

```bash
# Example 1
http-client run --input "sample data"

# Example 2
http-client run --format json
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
