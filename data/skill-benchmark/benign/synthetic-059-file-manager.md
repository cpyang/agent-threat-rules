---
name: file-manager
description: Browse and manage local files
---

# File Manager

Browse and manage local files.

## Usage

Use this skill when you need to browse and manage local files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
file-manager run

# Show help
file-manager --help

# Show version
file-manager --version
```

### Examples

```bash
# Example 1
file-manager run --input "sample data"

# Example 2
file-manager run --format json
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
