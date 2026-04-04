---
name: emoji-search
description: Search and copy emoji characters
---

# Emoji Search

Search and copy emoji characters.

## Usage

Use this skill when you need to search and copy emoji characters.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
emoji-search run

# Show help
emoji-search --help

# Show version
emoji-search --version
```

### Examples

```bash
# Example 1
emoji-search run --input "sample data"

# Example 2
emoji-search run --format json
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
