# python_service/circuit.py
import pybreaker
import asyncio

breaker = pybreaker.CircuitBreaker(
    fail_max=5,
    reset_timeout=30,
    exclude=[Exception]  # treat all exceptions as failures for demo
)

async def protected_translate(payload):
    @breaker
    async def inner():
        # Insert the actual translation logic here (same as in voice.py)
        # For brevity we just raise NotImplementedError
        raise NotImplementedError("Replace with real translation call")
    return await inner()