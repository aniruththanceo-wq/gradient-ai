from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import IdMixin, TimestampMixin


class AcademicRecord(IdMixin, TimestampMixin, Base):
    __tablename__ = "academic_records"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    tenth_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    twelfth_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    previous_cgpa: Mapped[float] = mapped_column(Float, nullable=False)
    previous_sgpa: Mapped[float | None] = mapped_column(Float)
    attendance_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    weekday_study_hours: Mapped[float] = mapped_column(Float, nullable=False)
    weekend_study_hours: Mapped[float] = mapped_column(Float, nullable=False)
    consistency: Mapped[str] = mapped_column(String(40), nullable=False)
    preferred_study_time: Mapped[str] = mapped_column(String(40), nullable=False)
    revision_frequency: Mapped[str] = mapped_column(String(40), nullable=False)
    study_method: Mapped[str] = mapped_column(String(120), nullable=False)

    subjects: Mapped[list["SubjectEnrollment"]] = relationship(back_populates="academic_record", cascade="all, delete-orphan")


class Subject(IdMixin, TimestampMixin, Base):
    __tablename__ = "subjects"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_subject_user_name"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    code: Mapped[str | None] = mapped_column(String(40))

    enrollments: Mapped[list["SubjectEnrollment"]] = relationship(back_populates="subject")


class SubjectEnrollment(IdMixin, TimestampMixin, Base):
    __tablename__ = "subject_enrollments"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    academic_record_id: Mapped[str] = mapped_column(ForeignKey("academic_records.id", ondelete="CASCADE"), index=True)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True)
    max_ia_marks: Mapped[float] = mapped_column(Float, nullable=False)
    attendance_percentage: Mapped[float | None] = mapped_column(Float)

    academic_record: Mapped[AcademicRecord] = relationship(back_populates="subjects")
    subject: Mapped[Subject] = relationship(back_populates="enrollments")
    assessments: Mapped[list["IAAssessment"]] = relationship(back_populates="subject_enrollment", cascade="all, delete-orphan")


class IAAssessment(IdMixin, TimestampMixin, Base):
    __tablename__ = "ia_assessments"
    __table_args__ = (UniqueConstraint("subject_enrollment_id", "assessment_index", name="uq_ia_assessment_index"),)

    subject_enrollment_id: Mapped[str] = mapped_column(
        ForeignKey("subject_enrollments.id", ondelete="CASCADE"),
        index=True,
    )
    assessment_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    assessment_date: Mapped[date | None] = mapped_column(Date)

    subject_enrollment: Mapped[SubjectEnrollment] = relationship(back_populates="assessments")
    mark: Mapped["IAMark"] = relationship(back_populates="assessment", cascade="all, delete-orphan")


class IAMark(IdMixin, TimestampMixin, Base):
    __tablename__ = "ia_marks"
    __table_args__ = (UniqueConstraint("ia_assessment_id", name="uq_ia_mark_assessment"),)

    ia_assessment_id: Mapped[str] = mapped_column(ForeignKey("ia_assessments.id", ondelete="CASCADE"), index=True)
    marks_obtained: Mapped[float] = mapped_column(Float, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False)

    assessment: Mapped[IAAssessment] = relationship(back_populates="mark")


class AcademicPrediction(IdMixin, TimestampMixin, Base):
    __tablename__ = "academic_predictions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    academic_record_id: Mapped[str] = mapped_column(ForeignKey("academic_records.id", ondelete="CASCADE"), index=True)
    predicted_cgpa: Mapped[float] = mapped_column(Float, nullable=False)
    feature_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    contributing_factors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)


class AcademicRiskResult(IdMixin, TimestampMixin, Base):
    __tablename__ = "academic_risk_results"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    academic_record_id: Mapped[str] = mapped_column(ForeignKey("academic_records.id", ondelete="CASCADE"), index=True)
    risk_level: Mapped[str] = mapped_column(String(40), nullable=False)
    feature_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    explanation: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    model_version: Mapped[str] = mapped_column(String(80), nullable=False)


class Timetable(IdMixin, TimestampMixin, Base):
    __tablename__ = "timetables"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    academic_record_id: Mapped[str | None] = mapped_column(ForeignKey("academic_records.id", ondelete="SET NULL"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    strategy_notes: Mapped[str] = mapped_column(Text, nullable=False)

    items: Mapped[list["TimetableItem"]] = relationship(back_populates="timetable", cascade="all, delete-orphan")


class TimetableItem(IdMixin, TimestampMixin, Base):
    __tablename__ = "timetable_items"

    timetable_id: Mapped[str] = mapped_column(ForeignKey("timetables.id", ondelete="CASCADE"), index=True)
    study_date: Mapped[date] = mapped_column(Date, nullable=False)
    subject_name: Mapped[str] = mapped_column(String(160), nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)
    activity: Mapped[str] = mapped_column(String(160), nullable=False)
    priority: Mapped[str] = mapped_column(String(40), nullable=False)

    timetable: Mapped[Timetable] = relationship(back_populates="items")

