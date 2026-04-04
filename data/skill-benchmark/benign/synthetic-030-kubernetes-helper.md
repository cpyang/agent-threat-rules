---
name: kubernetes-helper
description: Manage Kubernetes pods and services
---

# Kubernetes Helper

Manage Kubernetes pods and services.

## Usage

Use this skill when you need to manage kubernetes pods and services.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
kubernetes-helper run

# Show help
kubernetes-helper --help

# Show version
kubernetes-helper --version
```

### Examples

```bash
# Example 1
kubernetes-helper run --input "sample data"

# Example 2
kubernetes-helper run --format json
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
