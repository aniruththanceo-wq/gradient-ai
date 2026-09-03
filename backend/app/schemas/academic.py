from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator


class IAMarkInput(BaseModel):
    assessment_index: int = Field(ge=1, le=20)
    title: str | None = Field(default=None, max_length=80)
    marks_obtained: float = Field(ge=0)
    max_marks: float = Field(gt=0)
    assessment_date: date | None = None

    @model_validator(mode="after")
    def marks_must_fit_max(self):
        if self.marks_obtained > self.max_marks:
            raise ValueError("marks_obtained cannot exceed max_marks")
        return self


class SubjectInput(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    code: str | None = Field(default=None, max_length=40)
    max_ia_marks: float = Field(gt=0)
    attendance_percentage: float | None = Field(default=None, ge=0, le=100)
    ia_marks: list[IAMarkInput] = Field(min_length=1, max_length=20)


class AcademicRecordCreate(BaseModel):
    semester: int = Field(ge=1, le=8)
    tenth_percentage: float = Field(ge=0, le=100)
    twelfth_percentage: float = Field(ge=0, le=100)
    previous_cgpa: float = Field(ge=0, le=10)
    previous_sgpa: float | None = Field(default=None, ge=0, le=10)
    attendance_percentage: float = Field(ge=0, le=100)
    weekday_study_hours: float = Field(ge=0, le=16)
    weekend_study_hours: float = Field(ge=0, le=24)
    consistency: str = Field(max_length=40)
    preferred_study_time: str = Field(max_length=40)
    revision_frequency: str = Field(max_length=40)
    study_method: str = Field(max_length=120)
    subjects: list[SubjectInput] = Field(min_length=1, max_length=16)


class IAMarkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assessment_index: int
    title: str
    marks_obtained: float
    max_marks: float


class SubjectAnalysisRead(BaseModel):
    subject: str
    marks: list[float]
    percentages: list[float]
    average_percentage: float
    latest_percentage: float
    trend: str
    normalized_slope: float
    attendance_percentage: float | None
    weakness_score: float
    priority: str
    reasons: list[str]


class AcademicAnalysisRead(BaseModel):
    record_id: str
    average_ia_percentage: float
    overall_trend: str
    subjects: list[SubjectAnalysisRead]
    strongest_subject: str | None
    weakest_subject: str | None
    recommendations: list[str]


class AcademicPredictionRead(BaseModel):
    predicted_cgpa: float
    risk_level: str
    feature_snapshot: dict
    contributing_factors: list[str]
    model_version: str


class ExamDateInput(BaseModel):
    subject_name: str = Field(min_length=2, max_length=160)
    exam_date: date


class TimetableRequest(BaseModel):
    academic_record_id: str
    exam_dates: list[ExamDateInput] = Field(min_length=1)
    available_study_hours_per_day: float = Field(ge=1, le=12)
    preferred_start_time: str = Field(default="18:00", pattern=r"^\d{2}:\d{2}$")
    block_minutes: int = Field(default=60, ge=30, le=120)
    include_weekends: bool = True


class TimetableItemRead(BaseModel):
    study_date: date
    subject_name: str
    start_time: str
    end_time: str
    activity: str
    priority: str


class TimetableRead(BaseModel):
    id: str
    title: str
    strategy_notes: str
    items: list[TimetableItemRead]
