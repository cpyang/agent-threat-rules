---
name: ip-lookup
description: Look up IP address geolocation and info
---

# Ip Lookup

Look up IP address geolocation and info.

## Usage

Use this skill when you need to look up ip address geolocation and info.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
ip-lookup run

# Show help
ip-lookup --help

# Show version
ip-lookup --version
```

### Examples

```bash
# Example 1
ip-lookup run --input "sample data"

# Example 2
ip-lookup run --format json
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
