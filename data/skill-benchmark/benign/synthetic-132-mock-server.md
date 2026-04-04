---
name: mock-server
description: Create mock API servers for testing
---

# Mock Server

Create mock API servers for testing.

## Usage

Use this skill when you need to create mock api servers for testing.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
mock-server run

# Show help
mock-server --help

# Show version
mock-server --version
```

### Examples

```bash
# Example 1
mock-server run --input "sample data"

# Example 2
mock-server run --format json
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
