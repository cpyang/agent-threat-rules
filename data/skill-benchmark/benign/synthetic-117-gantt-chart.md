---
name: gantt-chart
description: Create Gantt charts for project timelines
---

# Gantt Chart

Create Gantt charts for project timelines.

## Usage

Use this skill when you need to create gantt charts for project timelines.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
gantt-chart run

# Show help
gantt-chart --help

# Show version
gantt-chart --version
```

### Examples

```bash
# Example 1
gantt-chart run --input "sample data"

# Example 2
gantt-chart run --format json
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
