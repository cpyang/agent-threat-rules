---
name: release-notes
description: Generate release notes from changes
---

# Release Notes

Generate release notes from changes.

## Usage

Use this skill when you need to generate release notes from changes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
release-notes run

# Show help
release-notes --help

# Show version
release-notes --version
```

### Examples

```bash
# Example 1
release-notes run --input "sample data"

# Example 2
release-notes run --format json
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
