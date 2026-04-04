---
name: websocket-client
description: Connect to and test WebSocket servers
---

# Websocket Client

Connect to and test WebSocket servers.

## Usage

Use this skill when you need to connect to and test websocket servers.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
websocket-client run

# Show help
websocket-client --help

# Show version
websocket-client --version
```

### Examples

```bash
# Example 1
websocket-client run --input "sample data"

# Example 2
websocket-client run --format json
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
