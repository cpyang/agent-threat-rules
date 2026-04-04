---
name: text-summarizer
description: Summarize long text documents
---

# Text Summarizer

Summarize long text documents.

## Usage

Use this skill when you need to summarize long text documents.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
text-summarizer run

# Show help
text-summarizer --help

# Show version
text-summarizer --version
```

### Examples

```bash
# Example 1
text-summarizer run --input "sample data"

# Example 2
text-summarizer run --format json
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
