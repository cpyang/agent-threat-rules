---
name: sentiment-analyzer
description: Analyze text sentiment and emotion
---

# Sentiment Analyzer

Analyze text sentiment and emotion.

## Usage

Use this skill when you need to analyze text sentiment and emotion.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sentiment-analyzer run

# Show help
sentiment-analyzer --help

# Show version
sentiment-analyzer --version
```

### Examples

```bash
# Example 1
sentiment-analyzer run --input "sample data"

# Example 2
sentiment-analyzer run --format json
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
