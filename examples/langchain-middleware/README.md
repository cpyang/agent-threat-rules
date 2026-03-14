# LangChain + ATR Middleware

Detect prompt injection **before** user input reaches your LLM by plugging
Agent Threat Rules into any LangChain chain as a `Runnable`.

## Quick Start

```bash
pip install -r requirements.txt

# Optional but recommended: install the Python ATR engine
pip install pyatr

# Or ensure npx is available as a fallback
npx agent-threat-rules --version

export OPENAI_API_KEY="sk-..."
python example.py
```

## How It Works

`atr_guard()` returns a LangChain `RunnableLambda` that scans every input
string against ATR rules. It automatically uses `pyatr` if installed, otherwise
falls back to `npx agent-threat-rules scan`.

```
User Input -> [ATR Guard] -> Prompt Template -> LLM -> Response
                  |
                  +-- threat found (confidence >= 0.7)
                        -> raise ThreatDetectedError / return safe message
```

## Usage in Your Own Chain

```python
from atr_middleware import atr_guard

guard = atr_guard(threshold=0.7, safe_message="I can't process that request.")

chain = guard | your_prompt | your_llm
response = chain.invoke(user_input)
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `threshold` | `0.7` | Minimum confidence score to block (0.0 - 1.0) |
| `safe_message` | `None` | If set, return this string instead of raising an error |

## Files

| File | Purpose |
|------|---------|
| `atr_middleware.py` | The middleware (drop into your project) |
| `example.py` | End-to-end demo with OpenAI |
| `requirements.txt` | Python dependencies |
