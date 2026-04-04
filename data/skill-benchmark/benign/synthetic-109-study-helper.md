---
name: study-helper
description: Create flashcards and spaced repetition
---

# Study Helper

Create flashcards and spaced repetition.

## Usage

Use this skill when you need to create flashcards and spaced repetition.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
study-helper run

# Show help
study-helper --help

# Show version
study-helper --version
```

### Examples

```bash
# Example 1
study-helper run --input "sample data"

# Example 2
study-helper run --format json
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
