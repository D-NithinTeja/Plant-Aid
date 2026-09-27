import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings


def rate_limit_key(request) -> str:
    """
    Buckets a request by the authenticated user when a valid Bearer token is present,
    falling back to the client IP for anonymous callers (Task 5.6).

    Keying on the JWT `sub` keeps one signed-in user's scanning traffic out of a bucket
    shared by everyone behind the same carrier NAT, while unauthenticated auth endpoints
    are still throttled per IP. Decoding is a local operation, so no request touches the
    database just to be counted.
    """
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            subject = payload.get("sub")
            if subject:
                return f"user:{subject}"
        except jwt.PyJWTError:
            # Malformed or expired tokens fall through to IP-based limiting
            pass

    return f"ip:{get_remote_address(request)}"


# Default rate limiter keyed per authenticated user, or per IP when unauthenticated
limiter = Limiter(key_func=rate_limit_key, default_limits=["120/minute"])
