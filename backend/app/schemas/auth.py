from __future__ import annotations

from pydantic import BaseModel, EmailStr

from app.schemas.profile import StudentProfileRead


class GoogleAuthRequest(BaseModel):
    credential: str


class DevAuthRequest(BaseModel):
    persona: str = "year_1_student"  # 'year_1_student', 'year_4_student', or 'new_student'
    email: EmailStr | None = None
    display_name: str | None = None
    academic_year: int | None = None
    semester: int | None = None


class UserRead(BaseModel):
    id: str
    email: EmailStr
    display_name: str | None = None
    avatar_url: str | None = None


class AuthSessionRead(BaseModel):
    user: UserRead
    profile: StudentProfileRead | None = None
    onboarding_required: bool
    session_token: str | None = None


