---
name: template-engine
description: Render templates with variables
---

# Template Engine

Render templates with variables.

## Usage

Use this skill when you need to render templates with variables.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
template-engine run

# Show help
template-engine --help

# Show version
template-engine --version
```

### Examples

```bash
# Example 1
template-engine run --input "sample data"

# Example 2
template-engine run --format json
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
