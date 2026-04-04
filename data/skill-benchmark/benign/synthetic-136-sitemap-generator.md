---
name: sitemap-generator
description: Generate XML sitemaps for websites
---

# Sitemap Generator

Generate XML sitemaps for websites.

## Usage

Use this skill when you need to generate xml sitemaps for websites.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sitemap-generator run

# Show help
sitemap-generator --help

# Show version
sitemap-generator --version
```

### Examples

```bash
# Example 1
sitemap-generator run --input "sample data"

# Example 2
sitemap-generator run --format json
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
