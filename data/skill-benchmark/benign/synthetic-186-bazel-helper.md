---
name: bazel-helper
description: Bazel build system utilities
---

# Bazel Helper

Bazel build system utilities.

## Usage

Use this skill when you need to bazel build system utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
bazel-helper run

# Show help
bazel-helper --help

# Show version
bazel-helper --version
```

### Examples

```bash
# Example 1
bazel-helper run --input "sample data"

# Example 2
bazel-helper run --format json
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
