---
name: flowchart-maker
description: Create flowcharts from process descriptions
---

# Flowchart Maker

Create flowcharts from process descriptions.

## Usage

Use this skill when you need to create flowcharts from process descriptions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
flowchart-maker run

# Show help
flowchart-maker --help

# Show version
flowchart-maker --version
```

### Examples

```bash
# Example 1
flowchart-maker run --input "sample data"

# Example 2
flowchart-maker run --format json
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
