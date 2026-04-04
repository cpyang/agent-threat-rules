---
name: diff-viewer
description: Compare and diff text files
---

# Diff Viewer

Compare and diff text files.

## Usage

Use this skill when you need to compare and diff text files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
diff-viewer run

# Show help
diff-viewer --help

# Show version
diff-viewer --version
```

### Examples

```bash
# Example 1
diff-viewer run --input "sample data"

# Example 2
diff-viewer run --format json
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
