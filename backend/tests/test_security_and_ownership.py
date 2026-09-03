from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.security import create_session_token
from app.db.session import SessionLocal
from app.main import app
from app.models import AcademicRecord, StudentProfile, User


def create_test_student(year: int, email_suffix: str) -> tuple[str, str]:
    db = SessionLocal()
    try:
        user = User(
            google_sub=f"google-sub-{email_suffix}",
            email=f"{email_suffix}@example.com",
            display_name=f"Student {email_suffix}",
        )
        db.add(user)
        db.flush()
        db.add(
            StudentProfile(
                user_id=user.id,
                full_name=f"Student {email_suffix}",
                college="Gradient Institute",
                department="Computer Science",
                academic_year=year,
                semester=year * 2 - 1,
                section="A",
            )
        )
        db.commit()
        return user.id, create_session_token(user.id)
    finally:
        db.close()


def test_student_cannot_access_other_student_academic_record() -> None:
    with TestClient(app) as client:
        user_a_id, token_a = create_test_student(1, "student_a_y1")
        user_b_id, token_b = create_test_student(1, "student_b_y1")

        # Student A creates an academic record
        payload = {
            "semester": 2,
            "tenth_percentage": 85.0,
            "twelfth_percentage": 82.0,
            "previous_cgpa": 8.0,
            "attendance_percentage": 80.0,
            "weekday_study_hours": 3.0,
            "weekend_study_hours": 5.0,
            "consistency": "consistent",
            "preferred_study_time": "morning",
            "revision_frequency": "weekly",
            "study_method": "concept mapping",
            "subjects": [
                {
                    "name": "Subject A",
                    "code": "CS101",
                    "max_ia_marks": 50,
                    "attendance_percentage": 80,
                    "ia_marks": [
                        {"assessment_index": 1, "marks_obtained": 35, "max_marks": 50},
                    ],
                }
            ],
        }
        res_a = client.post("/api/v1/academic/records", json=payload, headers={"Authorization": f"Bearer {token_a}"})
        assert res_a.status_code == 200
        record_id = res_a.json()["id"]

        # Student B attempts to read Student A's analysis -> Expect HTTP 404
        res_b = client.get(f"/api/v1/academic/records/{record_id}/analysis", headers={"Authorization": f"Bearer {token_b}"})
        assert res_b.status_code == 404

        # Student B attempts to run prediction on Student A's record -> Expect HTTP 404
        res_b_pred = client.post(f"/api/v1/academic/records/{record_id}/predict", headers={"Authorization": f"Bearer {token_b}"})
        assert res_b_pred.status_code == 404


def test_year_1_and_year_2_placement_lockout() -> None:
    with TestClient(app) as client:
        _, token_y1 = create_test_student(1, "lockout_y1")
        _, token_y2 = create_test_student(2, "lockout_y2")

        # Year 1 lockout tests
        y1_headers = {"Authorization": f"Bearer {token_y1}"}
        assert client.get("/api/v1/placement/profile", headers=y1_headers).status_code == 403
        assert client.post("/api/v1/placement/predict", headers=y1_headers).status_code == 403
        assert client.get("/api/v1/placement/projects", headers=y1_headers).status_code == 403
        assert client.post("/api/v1/reports/placement", headers=y1_headers).status_code == 403

        # Year 2 lockout tests
        y2_headers = {"Authorization": f"Bearer {token_y2}"}
        assert client.get("/api/v1/placement/profile", headers=y2_headers).status_code == 403
        assert client.post("/api/v1/placement/predict", headers=y2_headers).status_code == 403
        assert client.get("/api/v1/placement/projects", headers=y2_headers).status_code == 403
        assert client.post("/api/v1/reports/placement", headers=y2_headers).status_code == 403


def test_year_3_and_year_4_placement_authorized() -> None:
    with TestClient(app) as client:
        _, token_y3 = create_test_student(3, "allowed_y3")
        _, token_y4 = create_test_student(4, "allowed_y4")

        # Year 3 authorized
        y3_headers = {"Authorization": f"Bearer {token_y3}"}
        assert client.get("/api/v1/placement/profile", headers=y3_headers).status_code == 200
        assert client.get("/api/v1/placement/projects", headers=y3_headers).status_code == 200

        # Year 4 authorized
        y4_headers = {"Authorization": f"Bearer {token_y4}"}
        assert client.get("/api/v1/placement/profile", headers=y4_headers).status_code == 200
        assert client.get("/api/v1/placement/projects", headers=y4_headers).status_code == 200
