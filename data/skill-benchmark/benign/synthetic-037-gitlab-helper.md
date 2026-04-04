---
name: gitlab-helper
description: Interact with GitLab API for projects
---

# Gitlab Helper

Interact with GitLab API for projects.

## Usage

Use this skill when you need to interact with gitlab api for projects.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
gitlab-helper run

# Show help
gitlab-helper --help

# Show version
gitlab-helper --version
```

### Examples

```bash
# Example 1
gitlab-helper run --input "sample data"

# Example 2
gitlab-helper run --format json
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
