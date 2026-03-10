# python_service/ratelimit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/min"])

def add_rate_limit(app):
    app.state.limiter = limiter
    app.add_exception_handler(429, _rate_limit_exceeded_handler)