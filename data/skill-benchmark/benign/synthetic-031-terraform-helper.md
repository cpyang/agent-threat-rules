---
name: terraform-helper
description: Manage Terraform infrastructure
---

# Terraform Helper

Manage Terraform infrastructure.

## Usage

Use this skill when you need to manage terraform infrastructure.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
terraform-helper run

# Show help
terraform-helper --help

# Show version
terraform-helper --version
```

### Examples

```bash
# Example 1
terraform-helper run --input "sample data"

# Example 2
terraform-helper run --format json
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
