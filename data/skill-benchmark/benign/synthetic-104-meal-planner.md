---
name: meal-planner
description: Plan weekly meals and generate grocery lists
---

# Meal Planner

Plan weekly meals and generate grocery lists.

## Usage

Use this skill when you need to plan weekly meals and generate grocery lists.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
meal-planner run

# Show help
meal-planner --help

# Show version
meal-planner --version
```

### Examples

```bash
# Example 1
meal-planner run --input "sample data"

# Example 2
meal-planner run --format json
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
