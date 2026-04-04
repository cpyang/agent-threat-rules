---
name: jenkins-helper
description: Jenkins pipeline configuration
---

# Jenkins Helper

Jenkins pipeline configuration.

## Usage

Use this skill when you need to jenkins pipeline configuration.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
jenkins-helper run

# Show help
jenkins-helper --help

# Show version
jenkins-helper --version
```

### Examples

```bash
# Example 1
jenkins-helper run --input "sample data"

# Example 2
jenkins-helper run --format json
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
