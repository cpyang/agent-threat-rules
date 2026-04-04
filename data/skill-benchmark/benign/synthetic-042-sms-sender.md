---
name: sms-sender
description: Send SMS text messages
---

# Sms Sender

Send SMS text messages.

## Usage

Use this skill when you need to send sms text messages.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
sms-sender run

# Show help
sms-sender --help

# Show version
sms-sender --version
```

### Examples

```bash
# Example 1
sms-sender run --input "sample data"

# Example 2
sms-sender run --format json
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
