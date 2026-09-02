import datetime
import secrets
import string
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

security_scheme = HTTPBearer(auto_error=False)


def get_now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


def hash_password(password: str) -> str:
    """Hashes a password using standard bcrypt with cost factor 12 (Implementation.md §2.2)."""
    # bcrypt limits passwords to 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against stored bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def generate_otp_code(length: int = 6) -> str:
    """Generates a cryptographically random N-digit OTP code."""
    return "".join(secrets.choice(string.digits) for _ in range(length))


def constant_time_compare(val_a: str, val_b: str) -> bool:
    """Constant-time string comparison to resist timing attacks."""
    return secrets.compare_digest(val_a, val_b)


def create_access_token(
    data: dict, expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = get_now_utc() + expires_delta
    else:
        expire = get_now_utc() + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "iat": get_now_utc()})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates JWT access token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """FastAPI Dependency for authenticating requests via HTTP Bearer JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not auth or not auth.credentials:
        raise credentials_exception

    token = auth.credentials
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_exception

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or user.account_status != "ACTIVE":
        raise credentials_exception

    return user
