---
name: gradle-helper
description: Gradle build configuration helper
---

# Gradle Helper

Gradle build configuration helper.

## Usage

Use this skill when you need to gradle build configuration helper.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
gradle-helper run

# Show help
gradle-helper --help

# Show version
gradle-helper --version
```

### Examples

```bash
# Example 1
gradle-helper run --input "sample data"

# Example 2
gradle-helper run --format json
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
