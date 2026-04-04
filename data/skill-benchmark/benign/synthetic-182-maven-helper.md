---
name: maven-helper
description: Java Maven build and dependency helper
---

# Maven Helper

Java Maven build and dependency helper.

## Usage

Use this skill when you need to java maven build and dependency helper.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
maven-helper run

# Show help
maven-helper --help

# Show version
maven-helper --version
```

### Examples

```bash
# Example 1
maven-helper run --input "sample data"

# Example 2
maven-helper run --format json
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
