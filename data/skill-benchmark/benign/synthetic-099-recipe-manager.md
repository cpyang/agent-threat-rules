---
name: recipe-manager
description: Store search and organize recipes
---

# Recipe Manager

Store search and organize recipes.

## Usage

Use this skill when you need to store search and organize recipes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
recipe-manager run

# Show help
recipe-manager --help

# Show version
recipe-manager --version
```

### Examples

```bash
# Example 1
recipe-manager run --input "sample data"

# Example 2
recipe-manager run --format json
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
