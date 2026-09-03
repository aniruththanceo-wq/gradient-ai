from __future__ import annotations

from statistics import mean, pstdev

from app.models import AcademicRecord


def _linear_slope(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    xs = list(range(1, len(values) + 1))
    x_mean = mean(xs)
    y_mean = mean(values)
    denom = sum((x - x_mean) ** 2 for x in xs)
    if denom == 0:
        return 0.0
    return sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, values, strict=True)) / denom


def classify_trend(percentages: list[float]) -> tuple[str, float]:
    slope = _linear_slope(percentages)
    if len(percentages) < 2:
        return "stable", 0.0
    diffs = [b - a for a, b in zip(percentages, percentages[1:], strict=False)]
    sign_changes = sum(1 for a, b in zip(diffs, diffs[1:], strict=False) if (a >= 0 > b) or (a < 0 <= b))
    spread = max(percentages) - min(percentages)
    if sign_changes >= 1 and spread >= 12:
        return "fluctuating", round(slope / 100, 4)
    if slope >= 3:
        return "improving", round(slope / 100, 4)
    if slope <= -3:
        return "declining", round(slope / 100, 4)
    if pstdev(percentages) >= 10 and spread >= 15:
        return "fluctuating", round(slope / 100, 4)
    return "stable", round(slope / 100, 4)


def analyze_record(record: AcademicRecord) -> dict:
    subject_results = []
    all_latest = []
    all_averages = []
    slopes = []

    for enrollment in record.subjects:
        ordered = sorted(enrollment.assessments, key=lambda item: item.assessment_index)
        marks = [assessment.mark.marks_obtained for assessment in ordered if assessment.mark]
        max_marks = [assessment.mark.max_marks for assessment in ordered if assessment.mark]
        percentages = [round((mark / max_mark) * 100, 2) for mark, max_mark in zip(marks, max_marks, strict=True)]
        avg = round(mean(percentages), 2)
        latest = percentages[-1]
        trend, normalized_slope = classify_trend(percentages)
        attendance = enrollment.attendance_percentage

        weakness_score = (100 - latest) * 0.38 + (100 - avg) * 0.28
        if trend == "declining":
            weakness_score += 18
        elif trend == "fluctuating":
            weakness_score += 10
        elif trend == "improving":
            weakness_score -= 8
        if attendance is not None and attendance < 75:
            weakness_score += (75 - attendance) * 0.6
        weakness_score = round(max(0, min(100, weakness_score)), 2)

        priority = "High" if weakness_score >= 60 else "Moderate" if weakness_score >= 35 else "Low"
        reasons = []
        if latest < 60:
            reasons.append(f"Latest IA is {latest:.1f}%.")
        if avg < 65:
            reasons.append(f"Average IA performance is {avg:.1f}%.")
        if trend == "declining":
            reasons.append("Performance trend is declining.")
        if trend == "fluctuating":
            reasons.append("IA scores are fluctuating.")
        if attendance is not None and attendance < 75:
            reasons.append(f"Attendance is below the 75% academic safety line at {attendance:.1f}%.")
        if not reasons:
            reasons.append("Current performance is relatively steady.")

        all_latest.append(latest)
        all_averages.append(avg)
        slopes.append(normalized_slope)
        subject_results.append(
            {
                "subject": enrollment.subject.name,
                "marks": marks,
                "percentages": percentages,
                "average_percentage": avg,
                "latest_percentage": latest,
                "trend": trend,
                "normalized_slope": normalized_slope,
                "attendance_percentage": attendance,
                "weakness_score": weakness_score,
                "priority": priority,
                "reasons": reasons,
            }
        )

    weakest = max(subject_results, key=lambda item: item["weakness_score"], default=None)
    strongest = min(subject_results, key=lambda item: item["weakness_score"], default=None)
    avg_ia = round(mean(all_averages), 2) if all_averages else 0.0
    overall_slope = round(mean(slopes), 4) if slopes else 0.0
    overall_trend = "improving" if overall_slope > 0.03 else "declining" if overall_slope < -0.03 else "stable"

    recommendations = []
    if weakest:
        recommendations.append(f"Prioritize {weakest['subject']} because it has the highest weakness score.")
    declining_subjects = [item["subject"] for item in subject_results if item["trend"] == "declining"]
    if declining_subjects:
        recommendations.append(f"Add targeted revision blocks for declining subjects: {', '.join(declining_subjects)}.")
    if record.attendance_percentage < 75:
        recommendations.append("Raise attendance above 75% before adding extra advanced topics.")
    if avg_ia < 65:
        recommendations.append("Use short daily practice sessions and weekly IA-style revision to lift the IA average.")
    if not recommendations:
        recommendations.append("Maintain the current study rhythm and reserve extra time for upcoming high-weight subjects.")

    return {
        "record_id": record.id,
        "average_ia_percentage": avg_ia,
        "overall_trend": overall_trend,
        "subjects": subject_results,
        "strongest_subject": strongest["subject"] if strongest else None,
        "weakest_subject": weakest["subject"] if weakest else None,
        "recommendations": recommendations,
    }


def academic_feature_snapshot(record: AcademicRecord, analysis: dict) -> dict:
    weak_count = sum(1 for subject in analysis["subjects"] if subject["priority"] == "High")
    avg_slope = mean([subject["normalized_slope"] for subject in analysis["subjects"]]) if analysis["subjects"] else 0
    return {
        "tenth_percentage": record.tenth_percentage,
        "twelfth_percentage": record.twelfth_percentage,
        "previous_cgpa": record.previous_cgpa,
        "previous_sgpa": record.previous_sgpa or record.previous_cgpa,
        "attendance_percentage": record.attendance_percentage,
        "weekday_study_hours": record.weekday_study_hours,
        "weekend_study_hours": record.weekend_study_hours,
        "average_ia_percentage": analysis["average_ia_percentage"],
        "average_ia_trend": round(avg_slope, 4),
        "weak_subject_count": weak_count,
    }

