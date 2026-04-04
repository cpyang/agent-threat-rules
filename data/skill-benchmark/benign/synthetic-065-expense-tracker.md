---
name: expense-tracker
description: Track expenses and budgets
---

# Expense Tracker

Track expenses and budgets.

## Usage

Use this skill when you need to track expenses and budgets.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
expense-tracker run

# Show help
expense-tracker --help

# Show version
expense-tracker --version
```

### Examples

```bash
# Example 1
expense-tracker run --input "sample data"

# Example 2
expense-tracker run --format json
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
