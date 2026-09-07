from slowapi import Limiter
from slowapi.util import get_remote_address

# Default rate limiter keying by remote client IP address
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
