---
name: xml-validator
description: Validate and format XML documents
---

# Xml Validator

Validate and format XML documents.

## Usage

Use this skill when you need to validate and format xml documents.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
xml-validator run

# Show help
xml-validator --help

# Show version
xml-validator --version
```

### Examples

```bash
# Example 1
xml-validator run --input "sample data"

# Example 2
xml-validator run --format json
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
