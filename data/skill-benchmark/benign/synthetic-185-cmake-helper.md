---
name: cmake-helper
description: CMake build system configuration
---

# Cmake Helper

CMake build system configuration.

## Usage

Use this skill when you need to cmake build system configuration.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cmake-helper run

# Show help
cmake-helper --help

# Show version
cmake-helper --version
```

### Examples

```bash
# Example 1
cmake-helper run --input "sample data"

# Example 2
cmake-helper run --format json
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
