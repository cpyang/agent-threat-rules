---
name: rss-reader
description: Read and manage RSS and Atom feeds
---

# Rss Reader

Read and manage RSS and Atom feeds.

## Usage

Use this skill when you need to read and manage rss and atom feeds.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
rss-reader run

# Show help
rss-reader --help

# Show version
rss-reader --version
```

### Examples

```bash
# Example 1
rss-reader run --input "sample data"

# Example 2
rss-reader run --format json
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
