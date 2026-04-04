---
name: diagram-maker
description: Create diagrams from text descriptions
---

# Diagram Maker

Create diagrams from text descriptions.

## Usage

Use this skill when you need to create diagrams from text descriptions.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
diagram-maker run

# Show help
diagram-maker --help

# Show version
diagram-maker --version
```

### Examples

```bash
# Example 1
diagram-maker run --input "sample data"

# Example 2
diagram-maker run --format json
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
