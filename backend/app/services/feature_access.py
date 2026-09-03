from __future__ import annotations

from app.models import StudentProfile


def placement_enabled(profile: StudentProfile) -> bool:
    return profile.academic_year in (3, 4)


def feature_access(profile: StudentProfile) -> dict:
    placement = placement_enabled(profile)
    return {
        "academic_intelligence": True,
        "placement_intelligence": placement,
        "message": (
            "Academic and Placement Intelligence are available for your year."
            if placement
            else "Academic Intelligence is available now. Placement Intelligence opens in Year 3."
        ),
    }

