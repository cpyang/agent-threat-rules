---
name: certificate-manager
description: Manage SSL TLS certificates
---

# Certificate Manager

Manage SSL TLS certificates.

## Usage

Use this skill when you need to manage ssl tls certificates.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
certificate-manager run

# Show help
certificate-manager --help

# Show version
certificate-manager --version
```

### Examples

```bash
# Example 1
certificate-manager run --input "sample data"

# Example 2
certificate-manager run --format json
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
