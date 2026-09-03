from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_required_profile
from app.db.session import get_db
from app.models import AcademicRecord, User
from app.schemas.academic import (
    AcademicAnalysisRead,
    AcademicPredictionRead,
    AcademicRecordCreate,
    TimetableRead,
    TimetableRequest,
)
from app.services.academic_analysis import analyze_record
from app.services.academic_service import create_academic_record, generate_timetable, get_academic_record, list_academic_records, predict_academics


router = APIRouter(prefix="/academic", tags=["academic"], dependencies=[Depends(get_required_profile)])


@router.post("/records", response_model=dict)
def create_record(payload: AcademicRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    record = create_academic_record(db, current_user, payload)
    return {"id": record.id, "message": "Academic record saved"}


@router.get("/records", response_model=list[dict])
def list_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    records = list_academic_records(db, current_user.id)
    return [
        {
            "id": record.id,
            "semester": record.semester,
            "previous_cgpa": record.previous_cgpa,
            "attendance_percentage": record.attendance_percentage,
            "created_at": record.created_at.isoformat(),
        }
        for record in records
    ]


@router.get("/records/{record_id}/analysis", response_model=AcademicAnalysisRead)
def read_analysis(record_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    record: AcademicRecord = get_academic_record(db, current_user.id, record_id)
    return analyze_record(record)


@router.post("/records/{record_id}/predict", response_model=AcademicPredictionRead)
def run_prediction(record_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return predict_academics(db, current_user, record_id)


@router.post("/timetable", response_model=TimetableRead)
def create_timetable(payload: TimetableRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return generate_timetable(db, current_user, payload)

