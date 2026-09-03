from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_placement_access
from app.db.session import get_db
from app.models import Certification, Course, Internship, Project, User
from app.schemas.placement import (
    AssessmentQuestionRead,
    AssessmentResultRead,
    AssessmentSubmit,
    CertificationCreate,
    CertificationRead,
    CodingAttemptSubmit,
    CodingResultRead,
    CompanyPreparationRead,
    CompanyTargetCreate,
    CourseCreate,
    CourseRead,
    InternshipCreate,
    InternshipRead,
    PlacementPredictionRead,
    PlacementProfileRead,
    PlacementProfileUpsert,
    ProjectCreate,
    ProjectRead,
)
from app.services.placement_service import (
    create_certification,
    create_course,
    create_internship,
    create_project,
    get_placement_profile,
    list_coding_problems,
    list_owned,
    list_questions,
    predict_placement,
    set_company_target,
    submit_assessment,
    submit_coding_attempt,
    upsert_placement_profile,
)


router = APIRouter(prefix="/placement", tags=["placement"], dependencies=[Depends(require_placement_access)])


@router.put("/profile", response_model=PlacementProfileRead)
def save_profile(payload: PlacementProfileUpsert, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return upsert_placement_profile(db, current_user, payload)


@router.get("/profile", response_model=PlacementProfileRead | None)
def read_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_placement_profile(db, current_user.id)


@router.post("/projects", response_model=ProjectRead)
def add_project(payload: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_project(db, current_user, payload)


@router.get("/projects", response_model=list[ProjectRead])
def read_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_owned(db, Project, current_user.id)


@router.post("/internships", response_model=InternshipRead)
def add_internship(payload: InternshipCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_internship(db, current_user, payload)


@router.get("/internships", response_model=list[InternshipRead])
def read_internships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_owned(db, Internship, current_user.id)


@router.post("/certifications", response_model=CertificationRead)
def add_certification(payload: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_certification(db, current_user, payload)


@router.get("/certifications", response_model=list[CertificationRead])
def read_certifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_owned(db, Certification, current_user.id)


@router.post("/courses", response_model=CourseRead)
def add_course(payload: CourseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_course(db, current_user, payload)


@router.get("/courses", response_model=list[CourseRead])
def read_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_owned(db, Course, current_user.id)


@router.get("/assessments/{assessment_type}/questions", response_model=list[AssessmentQuestionRead])
def questions(assessment_type: str, db: Session = Depends(get_db)):
    return list_questions(db, assessment_type)


@router.post("/assessments/submit", response_model=AssessmentResultRead)
def submit(payload: AssessmentSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return submit_assessment(db, current_user, payload)


@router.get("/coding/problems", response_model=list[dict])
def coding_problems(db: Session = Depends(get_db)):
    return [
        {
            "id": problem.id,
            "title": problem.title,
            "difficulty": problem.difficulty,
            "prompt": problem.prompt,
            "safe_evaluation_notes": problem.safe_evaluation_notes,
            "max_score": problem.max_score,
        }
        for problem in list_coding_problems(db)
    ]


@router.post("/coding/submit", response_model=CodingResultRead)
def coding_submit(payload: CodingAttemptSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return submit_coding_attempt(db, current_user, payload)


@router.post("/predict", response_model=PlacementPredictionRead)
def predict(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return predict_placement(db, current_user)


@router.post("/company-target", response_model=CompanyPreparationRead)
def company_target(payload: CompanyTargetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return set_company_target(db, current_user, payload)

