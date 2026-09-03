from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class PlacementProfileUpsert(BaseModel):
    cgpa: float = Field(ge=0, le=10)
    tenth_percentage: float = Field(ge=0, le=100)
    twelfth_percentage: float = Field(ge=0, le=100)
    backlog_count: int = Field(default=0, ge=0, le=30)
    aptitude_score: float = Field(default=0, ge=0, le=100)
    coding_score: float = Field(default=0, ge=0, le=100)
    communication_score: float = Field(default=0, ge=0, le=100)
    dsa_preparation: str = Field(max_length=40)
    target_role: str = Field(max_length=120)
    programming_languages: list[str] = Field(default_factory=list, max_length=20)
    technical_skills: list[str] = Field(default_factory=list, max_length=40)


class PlacementProfileRead(PlacementProfileUpsert):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: str = Field(min_length=5)
    technologies: list[str] = Field(default_factory=list)
    role: str = Field(min_length=2, max_length=120)
    duration: str = Field(min_length=2, max_length=80)
    status: str = Field(min_length=2, max_length=40)
    link: str | None = Field(default=None, max_length=500)


class ProjectRead(ProjectCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str


class InternshipCreate(BaseModel):
    organization: str = Field(min_length=2, max_length=180)
    role: str = Field(min_length=2, max_length=120)
    duration: str = Field(min_length=2, max_length=80)
    technologies: list[str] = Field(default_factory=list)
    responsibilities: str = Field(min_length=5)
    outcomes: str = Field(min_length=5)
    certificate_url: str | None = Field(default=None, max_length=500)


class InternshipRead(InternshipCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str


class CertificationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    provider: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=120)
    issue_date: date | None = None
    credential_id: str | None = Field(default=None, max_length=160)
    credential_url: str | None = Field(default=None, max_length=500)


class CertificationRead(CertificationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str


class CourseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    provider: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=120)
    completion_status: str = Field(min_length=2, max_length=60)
    completion_date: date | None = None
    credential_url: str | None = Field(default=None, max_length=500)


class CourseRead(CourseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str


class AssessmentQuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    assessment_type: str
    category: str
    prompt: str
    options: list[str]
    difficulty: str


class AssessmentAnswerInput(BaseModel):
    question_id: str
    selected_answer: str


class AssessmentSubmit(BaseModel):
    assessment_type: str = Field(pattern="^(aptitude|communication)$")
    answers: list[AssessmentAnswerInput] = Field(min_length=1)
    time_taken_seconds: int | None = Field(default=None, ge=0)


class AssessmentResultRead(BaseModel):
    attempt_id: str
    score: float
    max_score: float
    percentage: float
    category_scores: dict


class CodingSubmissionInput(BaseModel):
    problem_id: str
    language: str = Field(min_length=2, max_length=60)
    submitted_code: str = Field(min_length=10, max_length=20000)


class CodingAttemptSubmit(BaseModel):
    submissions: list[CodingSubmissionInput] = Field(min_length=1, max_length=3)
    time_taken_seconds: int | None = Field(default=None, ge=0)


class CodingResultRead(BaseModel):
    attempt_id: str
    total_score: float
    execution_result: str
    review_notes: list[str]


class CompanyTargetCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=120)
    role: str | None = Field(default=None, max_length=120)


class CompanyPreparationRead(BaseModel):
    company_name: str
    focus_areas: list[str]
    source_label: str
    source_date: str


class PlacementPredictionRead(BaseModel):
    placement_probability: float
    predicted_status: str
    expected_lpa: float
    readiness_score: float
    readiness_dimensions: dict
    interview_stage_readiness: dict
    skill_gaps: list[str]
    recommendations: list[str]
    supporting_factors: list[str]
    model_version: str

