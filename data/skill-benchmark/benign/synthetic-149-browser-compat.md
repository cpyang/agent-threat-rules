---
name: browser-compat
description: Check browser feature compatibility
---

# Browser Compat

Check browser feature compatibility.

## Usage

Use this skill when you need to check browser feature compatibility.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
browser-compat run

# Show help
browser-compat --help

# Show version
browser-compat --version
```

### Examples

```bash
# Example 1
browser-compat run --input "sample data"

# Example 2
browser-compat run --format json
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
