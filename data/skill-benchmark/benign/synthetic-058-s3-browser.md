---
name: s3-browser
description: Browse and manage S3 bucket objects
---

# S3 Browser

Browse and manage S3 bucket objects.

## Usage

Use this skill when you need to browse and manage s3 bucket objects.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
s3-browser run

# Show help
s3-browser --help

# Show version
s3-browser --version
```

### Examples

```bash
# Example 1
s3-browser run --input "sample data"

# Example 2
s3-browser run --format json
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
