from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_required_profile, require_placement_access
from app.db.session import get_db
from app.models import User
from app.schemas.reports import ReportRead
from app.services.report_service import create_academic_report, create_placement_report, get_report_for_user


router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(get_required_profile)])


def _read(report) -> ReportRead:
    return ReportRead(
        id=report.id,
        report_type=report.report_type,
        title=report.title,
        file_path=report.file_path,
        download_url=f"/api/v1/reports/{report.id}/download",
    )


@router.post("/academic/{record_id}", response_model=ReportRead)
def academic_report(record_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportRead:
    return _read(create_academic_report(db, current_user, record_id))


@router.post("/placement", response_model=ReportRead, dependencies=[Depends(require_placement_access)])
def placement_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportRead:
    return _read(create_placement_report(db, current_user))


@router.get("/{report_id}/download")
def download_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = get_report_for_user(db, current_user.id, report_id)
    path = Path(report.file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Report file is no longer available")
    return FileResponse(str(path), media_type="application/pdf", filename=path.name)

