---
name: cargo-helper
description: Rust cargo package management utilities
---

# Cargo Helper

Rust cargo package management utilities.

## Usage

Use this skill when you need to rust cargo package management utilities.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
cargo-helper run

# Show help
cargo-helper --help

# Show version
cargo-helper --version
```

### Examples

```bash
# Example 1
cargo-helper run --input "sample data"

# Example 2
cargo-helper run --format json
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
