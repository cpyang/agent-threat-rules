---
name: docker-helper
description: Manage Docker containers and images
---

# Docker Helper

Manage Docker containers and images.

## Usage

Use this skill when you need to manage docker containers and images.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
docker-helper run

# Show help
docker-helper --help

# Show version
docker-helper --version
```

### Examples

```bash
# Example 1
docker-helper run --input "sample data"

# Example 2
docker-helper run --format json
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
