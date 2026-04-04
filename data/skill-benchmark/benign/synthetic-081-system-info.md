---
name: system-info
description: Display system hardware and software information
---

# System Info

Display system hardware and software information.

## Usage

Use this skill when you need to display system hardware and software information.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
system-info run

# Show help
system-info --help

# Show version
system-info --version
```

### Examples

```bash
# Example 1
system-info run --input "sample data"

# Example 2
system-info run --format json
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
