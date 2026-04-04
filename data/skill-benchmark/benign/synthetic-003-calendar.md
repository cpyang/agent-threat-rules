---
name: calendar
description: Manage calendar events and reminders
---

# Calendar

Manage calendar events and reminders.

## Usage

Use this skill when you need to manage calendar events and reminders.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
calendar run

# Show help
calendar --help

# Show version
calendar --version
```

### Examples

```bash
# Example 1
calendar run --input "sample data"

# Example 2
calendar run --format json
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
