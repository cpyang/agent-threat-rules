---
name: audio-transcriber
description: Transcribe audio files to text
---

# Audio Transcriber

Transcribe audio files to text.

## Usage

Use this skill when you need to transcribe audio files to text.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
audio-transcriber run

# Show help
audio-transcriber --help

# Show version
audio-transcriber --version
```

### Examples

```bash
# Example 1
audio-transcriber run --input "sample data"

# Example 2
audio-transcriber run --format json
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
