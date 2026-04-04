---
name: dns-resolver
description: Resolve DNS records for domains
---

# Dns Resolver

Resolve DNS records for domains.

## Usage

Use this skill when you need to resolve dns records for domains.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
dns-resolver run

# Show help
dns-resolver --help

# Show version
dns-resolver --version
```

### Examples

```bash
# Example 1
dns-resolver run --input "sample data"

# Example 2
dns-resolver run --format json
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
