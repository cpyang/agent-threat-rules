---
name: sprint-planner
description: Plan and track agile sprints
---

# Sprint Planner

Plan and track agile sprints.

## Usage

Use this skill when you need to plan and track agile sprints.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sprint-planner run

# Show help
sprint-planner --help

# Show version
sprint-planner --version
```

### Examples

```bash
# Example 1
sprint-planner run --input "sample data"

# Example 2
sprint-planner run --format json
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
