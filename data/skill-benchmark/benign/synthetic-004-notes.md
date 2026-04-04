---
name: notes
description: Create and organize text notes and documents
---

# Notes

Create and organize text notes and documents.

## Usage

Use this skill when you need to create and organize text notes and documents.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
notes run

# Show help
notes --help

# Show version
notes --version
```

### Examples

```bash
# Example 1
notes run --input "sample data"

# Example 2
notes run --format json
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
