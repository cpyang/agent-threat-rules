---
name: cookie-manager
description: Manage and inspect browser cookies
---

# Cookie Manager

Manage and inspect browser cookies.

## Usage

Use this skill when you need to manage and inspect browser cookies.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cookie-manager run

# Show help
cookie-manager --help

# Show version
cookie-manager --version
```

### Examples

```bash
# Example 1
cookie-manager run --input "sample data"

# Example 2
cookie-manager run --format json
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
