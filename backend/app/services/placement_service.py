from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.app_typing import UserLike
from app.ml.inference import ModelArtifactMissingError, predict_artifact, predict_probability
from app.models import (
    AssessmentAnswer,
    AssessmentAttempt,
    AssessmentQuestion,
    Certification,
    CodingAttempt,
    CodingProblem,
    CodingSubmission,
    CompanyPreparation,
    CompanyTarget,
    Course,
    Internship,
    PackagePrediction,
    PlacementPrediction,
    PlacementProfile,
    Project,
)
from app.schemas.placement import (
    AssessmentSubmit,
    CertificationCreate,
    CodingAttemptSubmit,
    CompanyTargetCreate,
    CourseCreate,
    InternshipCreate,
    PlacementProfileUpsert,
    ProjectCreate,
)


def upsert_placement_profile(db: Session, user: UserLike, payload: PlacementProfileUpsert) -> PlacementProfile:
    profile = db.query(PlacementProfile).filter(PlacementProfile.user_id == user.id).first()
    data = payload.model_dump()
    if profile is None:
        profile = PlacementProfile(user_id=user.id, **data)
        db.add(profile)
    else:
        for key, value in data.items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


def get_placement_profile(db: Session, user_id: str) -> PlacementProfile | None:
    return db.query(PlacementProfile).filter(PlacementProfile.user_id == user_id).first()


def create_project(db: Session, user: UserLike, payload: ProjectCreate) -> Project:
    entity = Project(user_id=user.id, **payload.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def create_internship(db: Session, user: UserLike, payload: InternshipCreate) -> Internship:
    entity = Internship(user_id=user.id, **payload.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def create_certification(db: Session, user: UserLike, payload: CertificationCreate) -> Certification:
    entity = Certification(user_id=user.id, **payload.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def create_course(db: Session, user: UserLike, payload: CourseCreate) -> Course:
    entity = Course(user_id=user.id, **payload.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def list_owned(db: Session, model, user_id: str):
    return db.query(model).filter(model.user_id == user_id).order_by(model.created_at.desc()).all()


def list_questions(db: Session, assessment_type: str) -> list[AssessmentQuestion]:
    return (
        db.query(AssessmentQuestion)
        .filter(AssessmentQuestion.assessment_type == assessment_type)
        .order_by(AssessmentQuestion.category, AssessmentQuestion.difficulty)
        .all()
    )


def submit_assessment(db: Session, user: UserLike, payload: AssessmentSubmit) -> dict:
    question_ids = [answer.question_id for answer in payload.answers]
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.id.in_(question_ids)).all()
    by_id = {question.id: question for question in questions}
    if len(by_id) != len(set(question_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more questions are invalid")

    score = 0.0
    category_totals: dict[str, dict[str, float]] = {}
    checked_answers = []
    for answer in payload.answers:
        question = by_id[answer.question_id]
        if question.assessment_type != payload.assessment_type:
            raise HTTPException(status_code=400, detail="Question does not belong to this assessment")
        correct = answer.selected_answer == question.correct_option
        score += 1 if correct else 0
        category = category_totals.setdefault(question.category, {"score": 0, "max_score": 0})
        category["score"] += 1 if correct else 0
        category["max_score"] += 1
        checked_answers.append((question, answer.selected_answer, correct))

    max_score = float(len(checked_answers))
    category_scores = {
        category: {
            "score": values["score"],
            "max_score": values["max_score"],
            "percentage": round((values["score"] / values["max_score"]) * 100, 2),
        }
        for category, values in category_totals.items()
    }
    attempt = AssessmentAttempt(
        user_id=user.id,
        assessment_type=payload.assessment_type,
        score=score,
        max_score=max_score,
        category_scores=category_scores,
        time_taken_seconds=payload.time_taken_seconds,
    )
    db.add(attempt)
    db.flush()
    for question, selected, correct in checked_answers:
        db.add(
            AssessmentAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_answer=selected,
                is_correct=correct,
            )
        )

    profile = get_placement_profile(db, user.id)
    if profile is not None:
        percentage = round((score / max_score) * 100, 2) if max_score else 0
        if payload.assessment_type == "aptitude":
            profile.aptitude_score = percentage
        if payload.assessment_type == "communication":
            profile.communication_score = percentage

    db.commit()
    return {
        "attempt_id": attempt.id,
        "score": score,
        "max_score": max_score,
        "percentage": round((score / max_score) * 100, 2) if max_score else 0,
        "category_scores": category_scores,
    }


def list_coding_problems(db: Session) -> list[CodingProblem]:
    return db.query(CodingProblem).order_by(CodingProblem.difficulty).all()


def submit_coding_attempt(db: Session, user: UserLike, payload: CodingAttemptSubmit) -> dict:
    problem_ids = [submission.problem_id for submission in payload.submissions]
    problems = db.query(CodingProblem).filter(CodingProblem.id.in_(problem_ids)).all()
    by_id = {problem.id: problem for problem in problems}
    if len(by_id) != len(set(problem_ids)):
        raise HTTPException(status_code=400, detail="One or more coding problems are invalid")

    attempt = CodingAttempt(user_id=user.id, time_taken_seconds=payload.time_taken_seconds, total_score=0)
    db.add(attempt)
    db.flush()
    notes: list[str] = []
    total_score = 0.0
    for submission in payload.submissions:
        problem = by_id[submission.problem_id]
        score, review_notes = safe_static_code_score(problem, submission.submitted_code)
        total_score += score
        notes.extend([f"{problem.title}: {note}" for note in review_notes])
        db.add(
            CodingSubmission(
                attempt_id=attempt.id,
                problem_id=problem.id,
                language=submission.language,
                submitted_code=submission.submitted_code,
                execution_result="static_review_only",
                tests_passed=0,
                score=score,
                review_notes=review_notes,
            )
        )
    attempt.total_score = total_score
    profile = get_placement_profile(db, user.id)
    if profile is not None:
        max_score = sum(by_id[submission.problem_id].max_score for submission in payload.submissions)
        profile.coding_score = round((total_score / max_score) * 100, 2) if max_score else 0
    db.commit()
    return {
        "attempt_id": attempt.id,
        "total_score": round(total_score, 2),
        "execution_result": "static_review_only",
        "review_notes": notes,
    }


def safe_static_code_score(problem: CodingProblem, code: str) -> tuple[float, list[str]]:
    lowered = code.lower()
    notes = ["Submission was not executed; Gradient AI v1 uses safe static review only."]
    score = problem.max_score * 0.25
    if "return" in lowered:
        score += problem.max_score * 0.2
        notes.append("Contains a return path.")
    if any(token in lowered for token in ["for ", "while ", ".map", "reduce"]):
        score += problem.max_score * 0.2
        notes.append("Contains iteration or collection processing.")
    if any(token in lowered for token in ["dict", "map", "set", "graph", "queue", "stack", "visited"]):
        score += problem.max_score * 0.2
        notes.append("Uses a relevant data-structure signal.")
    if len(code.strip()) > 120:
        score += problem.max_score * 0.15
        notes.append("Provides a non-trivial implementation body.")
    return round(min(problem.max_score, score), 2), notes


def placement_feature_snapshot(db: Session, user_id: str, profile: PlacementProfile) -> dict:
    project_count = db.query(Project).filter(Project.user_id == user_id).count()
    internship_count = db.query(Internship).filter(Internship.user_id == user_id).count()
    certification_count = db.query(Certification).filter(Certification.user_id == user_id).count()
    course_count = db.query(Course).filter(Course.user_id == user_id).count()
    dsa_map = {"none": 0, "beginner": 35, "intermediate": 65, "advanced": 90}
    return {
        "cgpa": profile.cgpa,
        "tenth_percentage": profile.tenth_percentage,
        "twelfth_percentage": profile.twelfth_percentage,
        "backlog_count": profile.backlog_count,
        "aptitude_score": profile.aptitude_score,
        "coding_score": profile.coding_score,
        "communication_score": profile.communication_score,
        "dsa_score": dsa_map.get(profile.dsa_preparation.lower(), 45),
        "project_count": project_count,
        "internship_count": internship_count,
        "certification_count": certification_count,
        "course_count": course_count,
        "technical_skill_count": len(profile.technical_skills),
        "language_count": len(profile.programming_languages),
    }


def predict_placement(db: Session, user: UserLike) -> dict:
    profile = get_placement_profile(db, user.id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Placement profile is required before prediction")
    features = placement_feature_snapshot(db, user.id, profile)
    try:
        probability, placement_artifact = predict_probability("placement_classifier.joblib", features)
        expected_lpa_raw, package_artifact = predict_artifact("package_regressor.joblib", features)
    except ModelArtifactMissingError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    probability = round(max(0.0, min(1.0, probability)), 4)
    expected_lpa = round(max(0.0, float(expected_lpa_raw)), 2)
    dimensions = readiness_dimensions(features)
    readiness_score = round(sum(dimensions.values()) / len(dimensions), 2)
    stage = {
        "Aptitude": readiness_label(features["aptitude_score"]),
        "Coding": readiness_label(features["coding_score"]),
        "Technical": readiness_label((features["dsa_score"] + min(100, features["technical_skill_count"] * 12)) / 2),
        "Communication/HR": readiness_label(features["communication_score"]),
    }
    skill_gaps = placement_skill_gaps(features)
    recommendations = placement_recommendations(features, skill_gaps)
    supporting = placement_supporting_factors(features)
    predicted_status = "Ready for placement attempts" if probability >= 0.6 else "Developing readiness"

    db.add(
        PlacementPrediction(
            user_id=user.id,
            probability=probability,
            predicted_status=predicted_status,
            readiness_score=readiness_score,
            feature_snapshot=features,
            supporting_factors=supporting,
            model_version=placement_artifact.get("version", "unknown"),
        )
    )
    db.add(
        PackagePrediction(
            user_id=user.id,
            expected_lpa=expected_lpa,
            feature_snapshot=features,
            supporting_factors=supporting,
            model_version=package_artifact.get("version", "unknown"),
        )
    )
    db.commit()
    return {
        "placement_probability": probability,
        "predicted_status": predicted_status,
        "expected_lpa": expected_lpa,
        "readiness_score": readiness_score,
        "readiness_dimensions": dimensions,
        "interview_stage_readiness": stage,
        "skill_gaps": skill_gaps,
        "recommendations": recommendations,
        "supporting_factors": supporting,
        "model_version": placement_artifact.get("version", "unknown"),
    }


def readiness_dimensions(features: dict) -> dict:
    academics = min(100, features["cgpa"] * 10)
    portfolio = min(100, features["project_count"] * 18 + features["internship_count"] * 24 + features["certification_count"] * 8)
    skills = min(100, features["technical_skill_count"] * 10 + features["language_count"] * 8 + features["dsa_score"] * 0.4)
    return {
        "academics": round(academics, 2),
        "aptitude": round(features["aptitude_score"], 2),
        "coding": round(features["coding_score"], 2),
        "communication": round(features["communication_score"], 2),
        "portfolio": round(portfolio, 2),
        "skills": round(skills, 2),
    }


def readiness_label(value: float) -> str:
    if value >= 75:
        return "Ready"
    if value >= 55:
        return "Developing"
    return "Needs improvement"


def placement_skill_gaps(features: dict) -> list[str]:
    gaps = []
    if features["aptitude_score"] < 60:
        gaps.append("Aptitude practice")
    if features["coding_score"] < 60:
        gaps.append("Coding assessment performance")
    if features["dsa_score"] < 60:
        gaps.append("DSA preparation")
    if features["communication_score"] < 60:
        gaps.append("Communication fundamentals")
    if features["project_count"] < 2:
        gaps.append("Project portfolio depth")
    if features["technical_skill_count"] < 4:
        gaps.append("Role-relevant technical skills")
    return gaps


def placement_recommendations(features: dict, gaps: list[str]) -> list[str]:
    if not gaps:
        return ["Maintain assessment rhythm and prepare company-specific interview stories from projects."]
    recommendations = [f"Highest priority: {gaps[0]}."]
    if "Project portfolio depth" in gaps:
        recommendations.append("Add one substantial project with measurable outcomes and a public repository or demo.")
    if "DSA preparation" in gaps:
        recommendations.append("Schedule focused DSA practice before attempting coding-heavy company rounds.")
    if features["backlog_count"] > 0:
        recommendations.append("Resolve or clearly document backlog recovery before placement applications.")
    return recommendations


def placement_supporting_factors(features: dict) -> list[str]:
    factors = []
    if features["cgpa"] >= 7.5:
        factors.append("CGPA is a positive placement-readiness signal.")
    if features["internship_count"] > 0:
        factors.append("Internship experience strengthens practical readiness.")
    if features["coding_score"] < 60:
        factors.append("Coding score is currently limiting placement readiness.")
    if features["communication_score"] >= 70:
        factors.append("Communication assessment is a relative strength.")
    return factors


def set_company_target(db: Session, user: UserLike, payload: CompanyTargetCreate) -> dict:
    target = CompanyTarget(user_id=user.id, company_name=payload.company_name, role=payload.role, preparation_status="planned")
    db.add(target)
    preparation = db.query(CompanyPreparation).filter(CompanyPreparation.company_name == payload.company_name).first()
    db.commit()
    if preparation is None:
        return {
            "company_name": payload.company_name,
            "focus_areas": ["DSA", "CS fundamentals", "projects", "communication", "role-specific skills"],
            "source_label": "Gradient AI generic company-preparation framework",
            "source_date": "2026-08-12",
        }
    return {
        "company_name": preparation.company_name,
        "focus_areas": preparation.focus_areas,
        "source_label": preparation.source_label,
        "source_date": preparation.source_date,
    }

