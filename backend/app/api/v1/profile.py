from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_required_profile
from app.db.session import get_db
from app.models import StudentProfile, User
from app.schemas.profile import FeatureAccessRead, StudentProfileCreate, StudentProfileRead, StudentProfileUpdate
from app.services.feature_access import feature_access
from app.services.profile_service import upsert_profile


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=StudentProfileRead)
def read_profile(profile: StudentProfile = Depends(get_required_profile)) -> StudentProfile:
    return profile


@router.put("", response_model=StudentProfileRead)
def save_profile(
    payload: StudentProfileCreate | StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentProfile:
    return upsert_profile(db, current_user, payload)


@router.get("/features", response_model=FeatureAccessRead)
def read_feature_access(profile: StudentProfile = Depends(get_required_profile)) -> dict:
    return feature_access(profile)

