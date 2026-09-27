import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models import User
from app.schemas import (
    TokenResponse,
    TwoFactorChallengeResponse,
    TwoFactorVerifyRequest,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.security import (
    constant_time_compare,
    create_access_token,
    generate_otp_code,
    get_current_user,
    get_now_utc,
    hash_password,
    verify_password,
)
from app.services.otp_service import otp_service

router = APIRouter(tags=["Authentication & 2FA"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account with bcrypt password hashing."""
    # Check duplicate email or phone
    query = db.query(User).filter(User.email_address == user_in.email_address)
    if user_in.phone_number:
        query = db.query(User).filter(
            or_(
                User.email_address == user_in.email_address,
                User.phone_number == user_in.phone_number,
            )
        )
    existing_user = query.first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address or phone number already exists",
        )

    new_user = User(
        user_name=user_in.user_name,
        email_address=user_in.email_address,
        phone_number=user_in.phone_number,
        password_hash=hash_password(user_in.password),
        is_2fa_enabled=True,
        account_status="ACTIVE",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TwoFactorChallengeResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(
    request: Request, credentials: UserLogin, db: Session = Depends(get_db)
):
    """Validates login credentials and initiates 2FA challenge returning an opaque session_id."""
    identifier = credentials.get_identifier()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address or phone number is required to login",
        )

    user = (
        db.query(User)
        .filter(or_(User.email_address == identifier, User.phone_number == identifier))
        .first()
    )

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password",
        )

    # Generate 6-digit OTP and opaque session_id
    otp_code = generate_otp_code(6)
    session_id = str(uuid.uuid4())
    expiry = get_now_utc() + datetime.timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    user.active_session_id = session_id
    user.active_2fa_otp = otp_code
    user.otp_expiry_time = expiry
    user.failed_otp_attempts = 0
    db.commit()

    # Dispatch OTP via configured provider (Console / Twilio / SendGrid)
    target_destination = (
        user.phone_number
        if (identifier == user.phone_number and user.phone_number)
        else user.email_address
    )
    otp_service.send_otp(destination=target_destination, otp_code=otp_code)

    return TwoFactorChallengeResponse(
        session_id=session_id,
        expires_in=settings.OTP_EXPIRE_MINUTES * 60,
        message="2FA verification challenge initiated. Please verify with the 6-digit code sent to your registered contact.",
        otp_code_dev=otp_code if settings.APP_DEBUG else None,
    )


@router.post("/verify-2fa", response_model=TokenResponse)
def verify_2fa(req: TwoFactorVerifyRequest, db: Session = Depends(get_db)):
    """Verifies the 2FA OTP code against the challenge session with brute-force rate capping."""
    # Challenge sessions are the only lookup path: the client never needs to know the user id,
    # so account enumeration through /auth/login stays closed (Task 2.2 / Task 2.4).
    user = db.query(User).filter(User.active_session_id == req.session_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired challenge session. Please log in again.",
        )

    # Brute-force protection: Max 5 attempts per session
    if user.failed_otp_attempts >= settings.MAX_OTP_ATTEMPTS:
        user.active_session_id = None
        user.active_2fa_otp = None
        user.otp_expiry_time = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Too many failed verification attempts. Challenge invalidated, please log in again.",
        )

    if not user.active_2fa_otp or not user.otp_expiry_time:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active 2FA challenge found for this session. Please log in again.",
        )

    if get_now_utc() > user.otp_expiry_time:
        user.active_session_id = None
        user.active_2fa_otp = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="2FA OTP code has expired. Please log in again.",
        )

    if not constant_time_compare(user.active_2fa_otp, req.otp_code.strip()):
        user.failed_otp_attempts += 1
        remaining_attempts = max(
            0, settings.MAX_OTP_ATTEMPTS - user.failed_otp_attempts
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid 2FA OTP code. {remaining_attempts} attempt(s) remaining before session lockout.",
        )

    # Verification successful: clear challenge state
    user.active_session_id = None
    user.active_2fa_otp = None
    user.otp_expiry_time = None
    user.failed_otp_attempts = 0
    db.commit()

    # Generate JWT Access Token (HS256, 60 minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email_address}
    )
    expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return TokenResponse(
        token_type="bearer",
        access_token=access_token,
        expires_in=expires_in_seconds,
        user_id=user.id,
        user_name=user.user_name,
        email_address=user.email_address,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves current logged-in user profile from validated JWT."""
    return current_user
