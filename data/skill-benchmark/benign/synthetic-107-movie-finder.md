---
name: movie-finder
description: Search and rate movies and TV shows
---

# Movie Finder

Search and rate movies and TV shows.

## Usage

Use this skill when you need to search and rate movies and tv shows.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
movie-finder run

# Show help
movie-finder --help

# Show version
movie-finder --version
```

### Examples

```bash
# Example 1
movie-finder run --input "sample data"

# Example 2
movie-finder run --format json
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
