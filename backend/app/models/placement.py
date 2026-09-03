from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import IdMixin, TimestampMixin


class Project(IdMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    technologies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    role: Mapped[str] = mapped_column(String(120), nullable=False)
    duration: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    link: Mapped[str | None] = mapped_column(String(500))


class Internship(IdMixin, TimestampMixin, Base):
    __tablename__ = "internships"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    organization: Mapped[str] = mapped_column(String(180), nullable=False)
    role: Mapped[str] = mapped_column(String(120), nullable=False)
    duration: Mapped[str] = mapped_column(String(80), nullable=False)
    technologies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    responsibilities: Mapped[str] = mapped_column(Text, nullable=False)
    outcomes: Mapped[str] = mapped_column(Text, nullable=False)
    certificate_url: Mapped[str | None] = mapped_column(String(500))


class Certification(IdMixin, TimestampMixin, Base):
    __tablename__ = "certifications"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    provider: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    issue_date: Mapped[date | None] = mapped_column(Date)
    credential_id: Mapped[str | None] = mapped_column(String(160))
    credential_url: Mapped[str | None] = mapped_column(String(500))


class Course(IdMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    provider: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    completion_status: Mapped[str] = mapped_column(String(60), nullable=False)
    completion_date: Mapped[date | None] = mapped_column(Date)
    credential_url: Mapped[str | None] = mapped_column(String(500))


class Skill(IdMixin, TimestampMixin, Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("name", name="uq_skill_name"),)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)


class StudentSkill(IdMixin, TimestampMixin, Base):
    __tablename__ = "student_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_student_skill"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), index=True)
    proficiency: Mapped[str] = mapped_column(String(40), nullable=False)


class PlacementProfile(IdMixin, TimestampMixin, Base):
    __tablename__ = "placement_profiles"
    __table_args__ = (UniqueConstraint("user_id", name="uq_placement_profile_user"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    cgpa: Mapped[float] = mapped_column(Float, nullable=False)
    tenth_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    twelfth_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    backlog_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    aptitude_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    coding_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    communication_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    dsa_preparation: Mapped[str] = mapped_column(String(40), nullable=False)
    target_role: Mapped[str] = mapped_column(String(120), nullable=False)
    programming_languages: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    technical_skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)


class AssessmentQuestion(IdMixin, TimestampMixin, Base):
    __tablename__ = "assessment_questions"

    assessment_type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    correct_option: Mapped[str] = mapped_column(String(500), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(40), nullable=False)


class AssessmentAttempt(IdMixin, TimestampMixin, Base):
    __tablename__ = "assessment_attempts"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    assessment_type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, nullable=False)
    category_scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer)


class AssessmentAnswer(IdMixin, TimestampMixin, Base):
    __tablename__ = "assessment_answers"

    attempt_id: Mapped[str] = mapped_column(ForeignKey("assessment_attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("assessment_questions.id", ondelete="CASCADE"), index=True)
    selected_answer: Mapped[str] = mapped_column(String(500), nullable=False)
    is_correct: Mapped[bool] = mapped_column(nullable=False)


class CodingProblem(IdMixin, TimestampMixin, Base):
    __tablename__ = "coding_problems"

    title: Mapped[str] = mapped_column(String(180), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(40), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    safe_evaluation_notes: Mapped[str] = mapped_column(Text, nullable=False)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)


class CodingAttempt(IdMixin, TimestampMixin, Base):
    __tablename__ = "coding_attempts"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    total_score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer)


class CodingSubmission(IdMixin, TimestampMixin, Base):
    __tablename__ = "coding_submissions"

    attempt_id: Mapped[str] = mapped_column(ForeignKey("coding_attempts.id", ondelete="CASCADE"), index=True)
    problem_id: Mapped[str] = mapped_column(ForeignKey("coding_problems.id", ondelete="CASCADE"), index=True)
    language: Mapped[str] = mapped_column(String(60), nullable=False)
    submitted_code: Mapped[str] = mapped_column(Text, nullable=False)
    execution_result: Mapped[str] = mapped_column(String(80), nullable=False)
    tests_passed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    review_notes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)


class PlacementPrediction(IdMixin, TimestampMixin, Base):
    __tablename__ = "placement_predictions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_status: Mapped[str] = mapped_column(String(40), nullable=False)
    readiness_score: Mapped[float] = mapped_column(Float, nullable=False)
    feature_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    supporting_factors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)


class PackagePrediction(IdMixin, TimestampMixin, Base):
    __tablename__ = "package_predictions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expected_lpa: Mapped[float] = mapped_column(Float, nullable=False)
    feature_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    supporting_factors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)


class CompanyTarget(IdMixin, TimestampMixin, Base):
    __tablename__ = "company_targets"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str | None] = mapped_column(String(120))
    preparation_status: Mapped[str] = mapped_column(String(60), nullable=False, default="planned")


class CompanyPreparation(IdMixin, TimestampMixin, Base):
    __tablename__ = "company_preparation"
    __table_args__ = (UniqueConstraint("company_name", name="uq_company_preparation_name"),)

    company_name: Mapped[str] = mapped_column(String(120), nullable=False)
    focus_areas: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    source_label: Mapped[str] = mapped_column(String(200), nullable=False)
    source_date: Mapped[str] = mapped_column(String(40), nullable=False)

