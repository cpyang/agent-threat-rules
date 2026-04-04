---
name: gcp-helper
description: Interact with Google Cloud Platform services
---

# Gcp Helper

Interact with Google Cloud Platform services.

## Usage

Use this skill when you need to interact with google cloud platform services.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
gcp-helper run

# Show help
gcp-helper --help

# Show version
gcp-helper --version
```

### Examples

```bash
# Example 1
gcp-helper run --input "sample data"

# Example 2
gcp-helper run --format json
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
