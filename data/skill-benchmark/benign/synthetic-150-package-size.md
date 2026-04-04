---
name: package-size
description: Check npm package bundle sizes
---

# Package Size

Check npm package bundle sizes.

## Usage

Use this skill when you need to check npm package bundle sizes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
package-size run

# Show help
package-size --help

# Show version
package-size --version
```

### Examples

```bash
# Example 1
package-size run --input "sample data"

# Example 2
package-size run --format json
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
