---
name: bookmark-manager
description: Manage and organize web bookmarks
---

# Bookmark Manager

Manage and organize web bookmarks.

## Usage

Use this skill when you need to manage and organize web bookmarks.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
bookmark-manager run

# Show help
bookmark-manager --help

# Show version
bookmark-manager --version
```

### Examples

```bash
# Example 1
bookmark-manager run --input "sample data"

# Example 2
bookmark-manager run --format json
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
