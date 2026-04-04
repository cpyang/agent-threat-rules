---
name: azure-helper
description: Interact with Microsoft Azure services
---

# Azure Helper

Interact with Microsoft Azure services.

## Usage

Use this skill when you need to interact with microsoft azure services.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
azure-helper run

# Show help
azure-helper --help

# Show version
azure-helper --version
```

### Examples

```bash
# Example 1
azure-helper run --input "sample data"

# Example 2
azure-helper run --format json
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
