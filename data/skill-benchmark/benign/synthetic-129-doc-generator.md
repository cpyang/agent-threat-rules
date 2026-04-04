---
name: doc-generator
description: Generate documentation from source code
---

# Doc Generator

Generate documentation from source code.

## Usage

Use this skill when you need to generate documentation from source code.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
doc-generator run

# Show help
doc-generator --help

# Show version
doc-generator --version
```

### Examples

```bash
# Example 1
doc-generator run --input "sample data"

# Example 2
doc-generator run --format json
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
