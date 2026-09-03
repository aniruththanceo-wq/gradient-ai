from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import StudentProfile, User
from app.schemas.profile import StudentProfileCreate, StudentProfileUpdate


def upsert_profile(db: Session, user: User, payload: StudentProfileCreate | StudentProfileUpdate) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    data = payload.model_dump()
    if profile is None:
        profile = StudentProfile(user_id=user.id, **data)
        db.add(profile)
    else:
        for key, value in data.items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

