---
name: log-viewer
description: View and filter application log files
---

# Log Viewer

View and filter application log files.

## Usage

Use this skill when you need to view and filter application log files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
log-viewer run

# Show help
log-viewer --help

# Show version
log-viewer --version
```

### Examples

```bash
# Example 1
log-viewer run --input "sample data"

# Example 2
log-viewer run --format json
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
