from __future__ import annotations

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import AuthenticationError, decode_session_token
from app.db.session import get_db
from app.models import StudentProfile, User
from app.repositories.user_repository import UserRepository
from app.services.feature_access import placement_enabled


def get_current_user(
    db: Session = Depends(get_db),
    session_token: str | None = Cookie(default=None, alias=get_settings().session_cookie_name),
    authorization: str | None = Header(default=None),
) -> User:
    token = session_token
    if not token and authorization:
        parts = authorization.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        elif len(parts) == 1:
            token = parts[0]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = decode_session_token(token)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    user = UserRepository(db).get_by_id(payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session user no longer exists")
    return user


def get_required_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfile:
    profile = UserRepository(db).get_profile(current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_428_PRECONDITION_REQUIRED, detail="Student onboarding is required")
    return profile


def require_placement_access(profile: StudentProfile = Depends(get_required_profile)) -> StudentProfile:
    if not placement_enabled(profile):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Placement Intelligence is available only for Year 3 and Year 4 students.",
        )
    return profile

