from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.app_typing import UserLike
from app.ml.inference import ModelArtifactMissingError, predict_artifact
from app.models import (
    AcademicPrediction,
    AcademicRecord,
    AcademicRiskResult,
    IAAssessment,
    IAMark,
    Subject,
    SubjectEnrollment,
    Timetable,
    TimetableItem,
)
from app.schemas.academic import AcademicRecordCreate, TimetableRequest
from app.services.academic_analysis import academic_feature_snapshot, analyze_record


def create_academic_record(db: Session, user: UserLike, payload: AcademicRecordCreate) -> AcademicRecord:
    record = AcademicRecord(
        user_id=user.id,
        semester=payload.semester,
        tenth_percentage=payload.tenth_percentage,
        twelfth_percentage=payload.twelfth_percentage,
        previous_cgpa=payload.previous_cgpa,
        previous_sgpa=payload.previous_sgpa,
        attendance_percentage=payload.attendance_percentage,
        weekday_study_hours=payload.weekday_study_hours,
        weekend_study_hours=payload.weekend_study_hours,
        consistency=payload.consistency,
        preferred_study_time=payload.preferred_study_time,
        revision_frequency=payload.revision_frequency,
        study_method=payload.study_method,
    )
    db.add(record)
    db.flush()
    for subject_payload in payload.subjects:
        subject = (
            db.query(Subject)
            .filter(Subject.user_id == user.id, Subject.name == subject_payload.name)
            .first()
        )
        if subject is None:
            subject = Subject(user_id=user.id, name=subject_payload.name, code=subject_payload.code)
            db.add(subject)
            db.flush()
        enrollment = SubjectEnrollment(
            user_id=user.id,
            academic_record_id=record.id,
            subject_id=subject.id,
            max_ia_marks=subject_payload.max_ia_marks,
            attendance_percentage=subject_payload.attendance_percentage,
        )
        db.add(enrollment)
        db.flush()
        for mark_payload in subject_payload.ia_marks:
            assessment = IAAssessment(
                subject_enrollment_id=enrollment.id,
                assessment_index=mark_payload.assessment_index,
                title=mark_payload.title or f"IA {mark_payload.assessment_index}",
                assessment_date=mark_payload.assessment_date,
            )
            db.add(assessment)
            db.flush()
            db.add(
                IAMark(
                    ia_assessment_id=assessment.id,
                    marks_obtained=mark_payload.marks_obtained,
                    max_marks=mark_payload.max_marks,
                )
            )
    db.commit()
    db.refresh(record)
    return record


def list_academic_records(db: Session, user_id: str) -> list[AcademicRecord]:
    return db.query(AcademicRecord).filter(AcademicRecord.user_id == user_id).order_by(AcademicRecord.created_at.desc()).all()


def get_academic_record(db: Session, user_id: str, record_id: str) -> AcademicRecord:
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id, AcademicRecord.user_id == user_id).first()
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Academic record not found")
    return record


def predict_academics(db: Session, user: UserLike, record_id: str) -> dict:
    record = get_academic_record(db, user.id, record_id)
    analysis = analyze_record(record)
    features = academic_feature_snapshot(record, analysis)
    try:
        cgpa_raw, cgpa_artifact = predict_artifact("academic_cgpa.joblib", features)
        risk_raw, risk_artifact = predict_artifact("academic_risk.joblib", features)
    except ModelArtifactMissingError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    predicted_cgpa = round(max(0.0, min(10.0, float(cgpa_raw))), 2)
    risk_level = str(risk_raw)
    factors = academic_factor_messages(features, analysis)

    db.add(
        AcademicPrediction(
            user_id=user.id,
            academic_record_id=record.id,
            predicted_cgpa=predicted_cgpa,
            feature_snapshot=features,
            contributing_factors=factors,
            model_version=cgpa_artifact.get("version", "unknown"),
        )
    )
    db.add(
        AcademicRiskResult(
            user_id=user.id,
            academic_record_id=record.id,
            risk_level=risk_level,
            feature_snapshot=features,
            explanation=factors,
            model_version=risk_artifact.get("version", "unknown"),
        )
    )
    db.commit()
    return {
        "predicted_cgpa": predicted_cgpa,
        "risk_level": risk_level,
        "feature_snapshot": features,
        "contributing_factors": factors,
        "model_version": cgpa_artifact.get("version", "unknown"),
    }


def academic_factor_messages(features: dict, analysis: dict) -> list[str]:
    messages = []
    if features["average_ia_percentage"] >= 75:
        messages.append("IA average is a positive signal for CGPA stability.")
    else:
        messages.append("IA average is currently the largest academic improvement lever.")
    if features["attendance_percentage"] < 75:
        messages.append("Attendance is below the safe academic threshold used by the advisory layer.")
    if features["average_ia_trend"] < -0.03:
        messages.append("Recent IA trend is declining and should be addressed before exams.")
    if analysis["weakest_subject"]:
        messages.append(f"{analysis['weakest_subject']} is the top weak-subject priority.")
    return messages


def generate_timetable(db: Session, user: UserLike, payload: TimetableRequest) -> dict:
    record = get_academic_record(db, user.id, payload.academic_record_id)
    analysis = analyze_record(record)
    subject_priority = {subject["subject"]: subject["weakness_score"] for subject in analysis["subjects"]}
    exams = sorted(payload.exam_dates, key=lambda item: item.exam_date)
    latest_exam = exams[-1].exam_date
    start_date = datetime.now(UTC).date()
    study_days = []
    cursor = start_date
    while cursor <= latest_exam:
        if payload.include_weekends or cursor.weekday() < 5:
            study_days.append(cursor)
        cursor += timedelta(days=1)
    if not study_days:
        raise HTTPException(status_code=422, detail="No feasible study days are available before the exam dates")

    blocks_per_day = max(1, int((payload.available_study_hours_per_day * 60) // payload.block_minutes))
    start_time = datetime.strptime(payload.preferred_start_time, "%H:%M")
    items = []
    for study_date in study_days:
        eligible = [exam for exam in exams if exam.exam_date >= study_date]
        if not eligible:
            continue
        ranked = sorted(
            eligible,
            key=lambda exam: (
                -subject_priority.get(exam.subject_name, 40),
                (exam.exam_date - study_date).days,
            ),
        )
        for block_index in range(blocks_per_day):
            exam = ranked[block_index % len(ranked)]
            block_start = start_time + timedelta(minutes=(payload.block_minutes + 10) * block_index)
            block_end = block_start + timedelta(minutes=payload.block_minutes)
            weakness = subject_priority.get(exam.subject_name, 40)
            priority = "High" if weakness >= 60 else "Moderate" if weakness >= 35 else "Low"
            activity = "Concept repair and IA mistake review" if priority == "High" else "Practice and spaced revision"
            items.append(
                {
                    "study_date": study_date,
                    "subject_name": exam.subject_name,
                    "start_time": block_start.strftime("%H:%M"),
                    "end_time": block_end.strftime("%H:%M"),
                    "activity": activity,
                    "priority": priority,
                }
            )

    timetable = Timetable(
        user_id=user.id,
        academic_record_id=record.id,
        title="Personalized Exam Preparation Plan",
        strategy_notes="Blocks are weighted by weak-subject priority and exam proximity with short breaks between sessions.",
    )
    db.add(timetable)
    db.flush()
    for item in items:
        db.add(TimetableItem(timetable_id=timetable.id, **item))
    db.commit()
    return {
        "id": timetable.id,
        "title": timetable.title,
        "strategy_notes": timetable.strategy_notes,
        "items": items,
    }

