from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import AuthenticationError, create_session_token, verify_google_id_token
from app.db.session import get_db
from app.models import StudentProfile, User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthSessionRead, DevAuthRequest, GoogleAuthRequest, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


def _session_response(user: User, db: Session, session_token: str | None = None) -> AuthSessionRead:
    profile = UserRepository(db).get_profile(user.id)
    return AuthSessionRead(
        user=UserRead(id=user.id, email=user.email, display_name=user.display_name, avatar_url=user.avatar_url),
        profile=profile,
        onboarding_required=profile is None,
        session_token=session_token,
    )


@router.post("/google", response_model=AuthSessionRead)
def google_auth(payload: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)) -> AuthSessionRead:
    try:
        token_info = verify_google_id_token(payload.credential)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    user = UserRepository(db).upsert_google_user(token_info)
    db.commit()
    token = create_session_token(user.id)
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.session_expire_minutes * 60,
    )
    return _session_response(user, db, session_token=token)


@router.post("/dev-login", response_model=AuthSessionRead)
def dev_login(payload: DevAuthRequest, response: Response, db: Session = Depends(get_db)) -> AuthSessionRead:
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Dev login is disabled in production")

    persona = payload.persona
    if persona == "year_1_student":
        email = payload.email or "alex.chen.y1@gradient.university"
        name = payload.display_name or "Alex Chen"
        google_sub = "dev-persona-year-1"
        target_year = 1
        target_semester = 2
    elif persona == "year_4_student":
        email = payload.email or "maya.patel.y4@gradient.university"
        name = payload.display_name or "Maya Patel"
        google_sub = "dev-persona-year-4"
        target_year = 4
        target_semester = 7
    elif persona == "new_student":
        email = payload.email or "new.student@gradient.university"
        name = payload.display_name or "New Student"
        google_sub = f"dev-persona-new-{email.split('@')[0]}"
        target_year = None
        target_semester = None
    else:
        email = payload.email or f"{persona}@gradient.university"
        name = payload.display_name or persona.replace("_", " ").title()
        google_sub = f"dev-persona-{persona}"
        target_year = payload.academic_year
        target_semester = payload.semester

    user = UserRepository(db).upsert_google_user({
        "sub": google_sub,
        "email": email,
        "name": name,
        "picture": f"https://api.dicebear.com/7.x/bottts/svg?seed={name}",
    })
    db.commit()

    if target_year is not None:
        profile = UserRepository(db).get_profile(user.id)
        if profile is None:
            profile = StudentProfile(
                user_id=user.id,
                full_name=name,
                college="Gradient Institute of Technology",
                department="Computer Science & Engineering",
                academic_year=target_year,
                semester=target_semester or (target_year * 2 - 1),
                section="A",
            )
            db.add(profile)
        else:
            profile.academic_year = target_year
            profile.semester = target_semester or (target_year * 2 - 1)
        db.commit()

    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.session_expire_minutes * 60,
    )
    return _session_response(user, db, session_token=token)


@router.get("/me", response_model=AuthSessionRead)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AuthSessionRead:
    token = create_session_token(current_user.id)
    return _session_response(current_user, db, session_token=token)


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    settings = get_settings()
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    return {"message": "Signed out"}


