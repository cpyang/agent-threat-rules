---
name: readme-generator
description: Generate README files from project metadata
---

# Readme Generator

Generate README files from project metadata.

## Usage

Use this skill when you need to generate readme files from project metadata.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
readme-generator run

# Show help
readme-generator --help

# Show version
readme-generator --version
```

### Examples

```bash
# Example 1
readme-generator run --input "sample data"

# Example 2
readme-generator run --format json
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
