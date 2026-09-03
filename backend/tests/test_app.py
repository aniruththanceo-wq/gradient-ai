from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.security import create_session_token
from app.db.session import SessionLocal
from app.main import app
from app.models import StudentProfile, User
from app.schemas.profile import StudentProfileCreate


def create_student(year: int) -> tuple[str, str]:
    db = SessionLocal()
    try:
        user = User(
            google_sub=f"google-sub-year-{year}",
            email=f"year{year}@example.com",
            display_name=f"Year {year} Student",
        )
        db.add(user)
        db.flush()
        db.add(
            StudentProfile(
                user_id=user.id,
                full_name=f"Year {year} Student",
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


def test_health_endpoint_starts_app() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_profile_schema_rejects_invalid_year() -> None:
    with pytest.raises(ValidationError):
        StudentProfileCreate(
            full_name="Student",
            college="Gradient Institute",
            department="Computer Science",
            academic_year=5,
            semester=1,
        )


def test_dev_login_and_full_academic_flow() -> None:
    with TestClient(app) as client:
        # Dev login as Year 1 student
        login_res = client.post("/api/v1/auth/dev-login", json={"persona": "year_1_student"})
        assert login_res.status_code == 200
        session_data = login_res.json()
        assert session_data["profile"]["academic_year"] == 1
        token = session_data["session_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create academic record
        academic_payload = {
            "semester": 2,
            "tenth_percentage": 90.5,
            "twelfth_percentage": 88.0,
            "previous_cgpa": 8.2,
            "previous_sgpa": 8.4,
            "attendance_percentage": 82.0,
            "weekday_study_hours": 3.0,
            "weekend_study_hours": 6.0,
            "consistency": "consistent",
            "preferred_study_time": "morning",
            "revision_frequency": "weekly",
            "study_method": "concept mapping & practice",
            "subjects": [
                {
                    "name": "Data Structures",
                    "code": "CS201",
                    "max_ia_marks": 50,
                    "attendance_percentage": 85,
                    "ia_marks": [
                        {"assessment_index": 1, "marks_obtained": 38, "max_marks": 50},
                        {"assessment_index": 2, "marks_obtained": 42, "max_marks": 50},
                        {"assessment_index": 3, "marks_obtained": 45, "max_marks": 50},
                    ],
                },
                {
                    "name": "Discrete Mathematics",
                    "code": "MA201",
                    "max_ia_marks": 50,
                    "attendance_percentage": 70,
                    "ia_marks": [
                        {"assessment_index": 1, "marks_obtained": 35, "max_marks": 50},
                        {"assessment_index": 2, "marks_obtained": 30, "max_marks": 50},
                        {"assessment_index": 3, "marks_obtained": 28, "max_marks": 50},
                    ],
                },
            ],
        }
        rec_res = client.post("/api/v1/academic/records", json=academic_payload, headers=headers)
        assert rec_res.status_code == 200
        record_id = rec_res.json()["id"]

        # Analysis
        analysis_res = client.get(f"/api/v1/academic/records/{record_id}/analysis", headers=headers)
        assert analysis_res.status_code == 200
        analysis = analysis_res.json()
        assert len(analysis["subjects"]) == 2
        assert analysis["weakest_subject"] == "Discrete Mathematics"
        assert len(analysis["recommendations"]) > 0

        # CGPA & Risk Prediction
        pred_res = client.post(f"/api/v1/academic/records/{record_id}/predict", headers=headers)
        assert pred_res.status_code == 200
        prediction = pred_res.json()
        assert 0.0 <= prediction["predicted_cgpa"] <= 10.0
        assert prediction["risk_level"] in ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]

        # Timetable Generation
        tt_payload = {
            "academic_record_id": record_id,
            "exam_dates": [
                {"subject_name": "Discrete Mathematics", "exam_date": "2026-10-15"},
                {"subject_name": "Data Structures", "exam_date": "2026-10-20"},
            ],
            "available_study_hours_per_day": 4.0,
            "preferred_start_time": "09:00",
            "block_minutes": 60,
            "include_weekends": True,
        }
        tt_res = client.post("/api/v1/academic/timetable", json=tt_payload, headers=headers)
        assert tt_res.status_code == 200
        assert len(tt_res.json()["items"]) > 0

        # Academic Report Generation
        rep_res = client.post(f"/api/v1/reports/academic/{record_id}", headers=headers)
        assert rep_res.status_code == 200
        report = rep_res.json()
        assert report["report_type"] == "academic"

        # Verify Year 1 cannot access Placement API (Forbidden)
        place_res = client.get("/api/v1/placement/profile", headers=headers)
        assert place_res.status_code == 403


def test_year_four_full_placement_flow() -> None:
    with TestClient(app) as client:
        # Dev login as Year 4 student
        login_res = client.post("/api/v1/auth/dev-login", json={"persona": "year_4_student"})
        assert login_res.status_code == 200
        token = login_res.json()["session_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Save placement profile
        place_profile_payload = {
            "cgpa": 8.4,
            "tenth_percentage": 92.0,
            "twelfth_percentage": 89.5,
            "backlog_count": 0,
            "aptitude_score": 75.0,
            "coding_score": 70.0,
            "communication_score": 80.0,
            "dsa_preparation": "advanced",
            "target_role": "Full Stack Engineer",
            "programming_languages": ["Python", "TypeScript", "Go"],
            "technical_skills": ["FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
        }
        p_res = client.put("/api/v1/placement/profile", json=place_profile_payload, headers=headers)
        assert p_res.status_code == 200

        # Add a project
        proj_payload = {
            "title": "Gradient AI Platform",
            "description": "Student Academic and Career Intelligence platform.",
            "technologies": ["Next.js", "FastAPI", "PostgreSQL", "scikit-learn"],
            "role": "Lead Architect",
            "duration": "4 months",
            "status": "completed",
            "link": "https://github.com/example/gradient-ai",
        }
        proj_res = client.post("/api/v1/placement/projects", json=proj_payload, headers=headers)
        assert proj_res.status_code == 200

        # Add an internship
        intern_payload = {
            "organization": "Acme Cloud Corp",
            "role": "Software Engineering Intern",
            "duration": "3 months",
            "technologies": ["Python", "AWS", "FastAPI"],
            "responsibilities": "Engineered distributed pipeline reducing job latency by 35%.",
            "outcomes": "Shipped to production and received return offer.",
            "certificate_url": "https://example.com/certificate",
        }
        intern_res = client.post("/api/v1/placement/internships", json=intern_payload, headers=headers)
        assert intern_res.status_code == 200

        # Fetch questions
        q_res = client.get("/api/v1/placement/assessments/aptitude/questions", headers=headers)
        assert q_res.status_code == 200
        questions = q_res.json()
        assert len(questions) >= 20

        # Submit Aptitude Assessment
        answers = [
            {"question_id": q["id"], "selected_answer": q["options"][0]}
            for q in questions[:5]
        ]
        sub_res = client.post(
            "/api/v1/placement/assessments/submit",
            json={"assessment_type": "aptitude", "time_taken_seconds": 120, "answers": answers},
            headers=headers,
        )
        assert sub_res.status_code == 200

        # Submit Coding Problem
        c_prob_res = client.get("/api/v1/placement/coding/problems", headers=headers)
        assert c_prob_res.status_code == 200
        problems = c_prob_res.json()
        assert len(problems) >= 3

        code_sub_res = client.post(
            "/api/v1/placement/coding/submit",
            json={
                "time_taken_seconds": 300,
                "submissions": [
                    {
                        "problem_id": problems[0]["id"],
                        "language": "python",
                        "submitted_code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
                    }
                ],
            },
            headers=headers,
        )
        assert code_sub_res.status_code == 200

        # Placement Prediction
        pred_res = client.post("/api/v1/placement/predict", headers=headers)
        assert pred_res.status_code == 200
        prediction = pred_res.json()
        assert 0.0 <= prediction["placement_probability"] <= 1.0
        assert prediction["expected_lpa"] > 0.0
        assert "readiness_dimensions" in prediction
        assert "interview_stage_readiness" in prediction

        # Target Company Setup
        comp_res = client.post(
            "/api/v1/placement/company-target",
            json={"company_name": "Google", "role": "Software Engineer"},
            headers=headers,
        )
        assert comp_res.status_code == 200
        assert len(comp_res.json()["focus_areas"]) > 0

        # Placement Report Generation
        rep_res = client.post("/api/v1/reports/placement", headers=headers)
        assert rep_res.status_code == 200
        assert rep_res.json()["report_type"] == "placement"


