---
name: quiz-maker
description: Create and take interactive quizzes
---

# Quiz Maker

Create and take interactive quizzes.

## Usage

Use this skill when you need to create and take interactive quizzes.

## Prerequisites

No special prerequisites required. Standard system tools only.

## Commands

### Basic Usage

```bash
# Run the main command
quiz-maker run

# Show help
quiz-maker --help

# Show version
quiz-maker --version
```

### Examples

```bash
# Example 1
quiz-maker run --input "sample data"

# Example 2
quiz-maker run --format json
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
