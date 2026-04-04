---
name: swagger-editor
description: Edit and validate OpenAPI Swagger specifications
---

# Swagger Editor

Edit and validate OpenAPI Swagger specifications.

## Usage

Use this skill when you need to edit and validate openapi swagger specifications.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
swagger-editor run

# Show help
swagger-editor --help

# Show version
swagger-editor --version
```

### Examples

```bash
# Example 1
swagger-editor run --input "sample data"

# Example 2
swagger-editor run --format json
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
