---
name: bundle-analyzer
description: Analyze JavaScript bundle composition
---

# Bundle Analyzer

Analyze JavaScript bundle composition.

## Usage

Use this skill when you need to analyze javascript bundle composition.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
bundle-analyzer run

# Show help
bundle-analyzer --help

# Show version
bundle-analyzer --version
```

### Examples

```bash
# Example 1
bundle-analyzer run --input "sample data"

# Example 2
bundle-analyzer run --format json
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
