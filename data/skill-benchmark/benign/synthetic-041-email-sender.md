---
name: email-sender
description: Compose and send email messages
---

# Email Sender

Compose and send email messages.

## Usage

Use this skill when you need to compose and send email messages.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
email-sender run

# Show help
email-sender --help

# Show version
email-sender --version
```

### Examples

```bash
# Example 1
email-sender run --input "sample data"

# Example 2
email-sender run --format json
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
