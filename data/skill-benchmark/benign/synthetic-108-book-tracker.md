---
name: book-tracker
description: Track reading progress and book lists
---

# Book Tracker

Track reading progress and book lists.

## Usage

Use this skill when you need to track reading progress and book lists.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
book-tracker run

# Show help
book-tracker --help

# Show version
book-tracker --version
```

### Examples

```bash
# Example 1
book-tracker run --input "sample data"

# Example 2
book-tracker run --format json
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
