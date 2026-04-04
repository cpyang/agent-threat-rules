---
name: word-counter
description: Count words characters and paragraphs
---

# Word Counter

Count words characters and paragraphs.

## Usage

Use this skill when you need to count words characters and paragraphs.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
word-counter run

# Show help
word-counter --help

# Show version
word-counter --version
```

### Examples

```bash
# Example 1
word-counter run --input "sample data"

# Example 2
word-counter run --format json
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
