---
name: pdf-reader
description: Extract text and metadata from PDF files
---

# Pdf Reader

Extract text and metadata from PDF files.

## Usage

Use this skill when you need to extract text and metadata from pdf files.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
pdf-reader run

# Show help
pdf-reader --help

# Show version
pdf-reader --version
```

### Examples

```bash
# Example 1
pdf-reader run --input "sample data"

# Example 2
pdf-reader run --format json
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
