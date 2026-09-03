from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from google.auth.transport import requests
from google.oauth2 import id_token
from jose import JWTError, jwt

from app.core.config import get_settings


SESSION_ALGORITHM = "HS256"


class AuthenticationError(Exception):
    """Raised when an authentication credential cannot be trusted."""


def create_session_token(user_id: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.session_expire_minutes)).timestamp()),
        "typ": "session",
    }
    return jwt.encode(payload, settings.session_secret, algorithm=SESSION_ALGORITHM)


def decode_session_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.session_secret, algorithms=[SESSION_ALGORITHM])
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired session") from exc
    if payload.get("typ") != "session" or not payload.get("sub"):
        raise AuthenticationError("Invalid session payload")
    return payload


def verify_google_id_token(credential: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.google_client_id:
        raise AuthenticationError("Google authentication is not configured")
    try:
        token_info = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise AuthenticationError("Invalid Google credential") from exc

    if token_info.get("aud") != settings.google_client_id:
        raise AuthenticationError("Google credential audience mismatch")
    if not token_info.get("sub") or not token_info.get("email"):
        raise AuthenticationError("Google credential is missing required identity fields")
    return token_info

