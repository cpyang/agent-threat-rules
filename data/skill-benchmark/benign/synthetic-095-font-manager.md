---
name: font-manager
description: Browse install and manage system fonts
---

# Font Manager

Browse install and manage system fonts.

## Usage

Use this skill when you need to browse install and manage system fonts.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
font-manager run

# Show help
font-manager --help

# Show version
font-manager --version
```

### Examples

```bash
# Example 1
font-manager run --input "sample data"

# Example 2
font-manager run --format json
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
