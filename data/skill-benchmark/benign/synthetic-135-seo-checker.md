---
name: seo-checker
description: Check SEO best practices and meta tags
---

# Seo Checker

Check SEO best practices and meta tags.

## Usage

Use this skill when you need to check seo best practices and meta tags.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
seo-checker run

# Show help
seo-checker --help

# Show version
seo-checker --version
```

### Examples

```bash
# Example 1
seo-checker run --input "sample data"

# Example 2
seo-checker run --format json
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
