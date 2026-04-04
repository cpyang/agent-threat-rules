---
name: api-doc-generator
description: Generate API documentation from specs
---

# Api Doc Generator

Generate API documentation from specs.

## Usage

Use this skill when you need to generate api documentation from specs.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
api-doc-generator run

# Show help
api-doc-generator --help

# Show version
api-doc-generator --version
```

### Examples

```bash
# Example 1
api-doc-generator run --input "sample data"

# Example 2
api-doc-generator run --format json
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
