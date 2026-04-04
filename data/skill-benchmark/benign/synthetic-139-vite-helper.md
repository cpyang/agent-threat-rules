---
name: vite-helper
description: Configure Vite development server and builds
---

# Vite Helper

Configure Vite development server and builds.

## Usage

Use this skill when you need to configure vite development server and builds.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
vite-helper run

# Show help
vite-helper --help

# Show version
vite-helper --version
```

### Examples

```bash
# Example 1
vite-helper run --input "sample data"

# Example 2
vite-helper run --format json
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
