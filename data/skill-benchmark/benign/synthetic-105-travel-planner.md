---
name: travel-planner
description: Plan trips with itineraries and budgets
---

# Travel Planner

Plan trips with itineraries and budgets.

## Usage

Use this skill when you need to plan trips with itineraries and budgets.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
travel-planner run

# Show help
travel-planner --help

# Show version
travel-planner --version
```

### Examples

```bash
# Example 1
travel-planner run --input "sample data"

# Example 2
travel-planner run --format json
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
