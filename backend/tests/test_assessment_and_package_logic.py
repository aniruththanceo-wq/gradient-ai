from __future__ import annotations

from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.models import CodingProblem
from app.schemas.academic import TimetableRequest
from app.services.placement_service import prototype_package_range, safe_static_code_score


def dimensions(value: float) -> dict[str, float]:
    return {
        "academics": value,
        "aptitude": value,
        "coding": value,
        "communication": value,
        "portfolio": value,
        "skills": value,
    }


def test_package_range_is_bounded_and_monotonic() -> None:
    expected = [prototype_package_range(dimensions(value))[0] for value in (0, 20, 50, 75, 100)]
    assert expected == sorted(expected)
    assert expected[0] == 4.0
    assert expected[-1] == 120.0
    for value in expected:
        assert 4.0 <= value <= 120.0


def test_one_weaker_dimension_never_improves_package() -> None:
    baseline = dimensions(75)
    reduced = {**baseline, "coding": 20}
    assert prototype_package_range(reduced)[0] < prototype_package_range(baseline)[0]


def test_static_review_rejects_prose_and_requires_expected_function() -> None:
    problem = CodingProblem(
        title="Array Sum & Target Pair",
        difficulty="easy",
        prompt="",
        safe_evaluation_notes="",
        max_score=20,
    )
    assert safe_static_code_score(problem, "This is a solution because the array needs two numbers.")[0] == 0
    assert safe_static_code_score(problem, "def solve(values):\n    return values")[0] == 0
    valid_score, notes = safe_static_code_score(
        problem,
        "def two_sum(nums, target):\n    seen = {}\n    for index, value in enumerate(nums):\n        if target - value in seen:\n            return [seen[target - value], index]\n        seen[value] = index\n    return []\n",
    )
    assert valid_score > 0
    assert "syntax" in notes[0].lower()


def test_timetable_rejects_duplicate_exam_entries() -> None:
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    with pytest.raises(ValidationError, match="duplicate subject"):
        TimetableRequest(
            academic_record_id="record",
            exam_dates=[
                {"subject_name": "Algorithms", "exam_date": tomorrow},
                {"subject_name": "algorithms", "exam_date": tomorrow},
            ],
            available_study_hours_per_day=3,
        )
