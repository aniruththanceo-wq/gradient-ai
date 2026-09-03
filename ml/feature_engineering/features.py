from __future__ import annotations

ACADEMIC_FEATURES = [
    "tenth_percentage",
    "twelfth_percentage",
    "previous_cgpa",
    "previous_sgpa",
    "attendance_percentage",
    "weekday_study_hours",
    "weekend_study_hours",
    "average_ia_percentage",
    "average_ia_trend",
    "weak_subject_count",
]

PLACEMENT_FEATURES = [
    "cgpa",
    "tenth_percentage",
    "twelfth_percentage",
    "backlog_count",
    "aptitude_score",
    "coding_score",
    "communication_score",
    "dsa_score",
    "project_count",
    "internship_count",
    "certification_count",
    "course_count",
    "technical_skill_count",
    "language_count",
]


def academic_risk_label(row) -> str:
    score = 0
    if row["previous_cgpa"] < 5.8:
        score += 3
    elif row["previous_cgpa"] < 6.8:
        score += 2
    if row["attendance_percentage"] < 65:
        score += 3
    elif row["attendance_percentage"] < 75:
        score += 2
    if row["average_ia_percentage"] < 50:
        score += 4
    elif row["average_ia_percentage"] < 65:
        score += 2
    if row["average_ia_trend"] < -0.05:
        score += 2
    score += min(3, int(row["weak_subject_count"]))

    if score >= 9:
        return "Critical Risk"
    if score >= 6:
        return "High Risk"
    if score >= 3:
        return "Moderate Risk"
    return "Low Risk"

