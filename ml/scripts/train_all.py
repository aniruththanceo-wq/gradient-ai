from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from ml.feature_engineering.features import ACADEMIC_FEATURES, PLACEMENT_FEATURES, academic_risk_label


MODEL_DIR = ROOT / "ml" / "models"
DATA_DIR = ROOT / "ml" / "data" / "processed"
VERSION = "prototype-synthetic-2026-08-12"


def make_academic_dataset(n: int = 700, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    tenth = rng.normal(78, 9, n).clip(35, 100)
    twelfth = (tenth + rng.normal(0, 7, n)).clip(35, 100)
    prev_cgpa = rng.normal(7.1, 1.0, n).clip(3.5, 9.8)
    previous_sgpa = (prev_cgpa + rng.normal(0, 0.35, n)).clip(3.5, 10)
    attendance = rng.normal(78, 12, n).clip(35, 100)
    weekday_hours = rng.normal(2.2, 1.0, n).clip(0, 8)
    weekend_hours = rng.normal(4.0, 1.8, n).clip(0, 12)
    ia = (
        38
        + prev_cgpa * 4.2
        + attendance * 0.16
        + weekday_hours * 2.0
        + weekend_hours * 0.9
        + rng.normal(0, 8, n)
    ).clip(25, 98)
    trend = rng.normal(0.01, 0.065, n).clip(-0.18, 0.18)
    weak_subject_count = np.round(((70 - ia).clip(0, 60) / 18) + rng.normal(0.5, 0.8, n)).clip(0, 6)
    final_cgpa = (
        prev_cgpa * 0.52
        + previous_sgpa * 0.12
        + ia * 0.025
        + attendance * 0.006
        + weekday_hours * 0.08
        + weekend_hours * 0.025
        + trend * 1.7
        - weak_subject_count * 0.08
        + rng.normal(0, 0.32, n)
    ).clip(0, 10)
    frame = pd.DataFrame(
        {
            "tenth_percentage": tenth,
            "twelfth_percentage": twelfth,
            "previous_cgpa": prev_cgpa,
            "previous_sgpa": previous_sgpa,
            "attendance_percentage": attendance,
            "weekday_study_hours": weekday_hours,
            "weekend_study_hours": weekend_hours,
            "average_ia_percentage": ia,
            "average_ia_trend": trend,
            "weak_subject_count": weak_subject_count,
            "final_cgpa": final_cgpa,
        }
    )
    frame["risk_label"] = frame.apply(academic_risk_label, axis=1)
    return frame


def make_placement_dataset(n: int = 800, seed: int = 91) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    cgpa = rng.normal(7.2, 1.0, n).clip(3.8, 10)
    tenth = rng.normal(78, 9, n).clip(35, 100)
    twelfth = (tenth + rng.normal(0, 8, n)).clip(35, 100)
    backlogs = rng.poisson(0.5, n).clip(0, 8)
    aptitude = rng.normal(62, 17, n).clip(0, 100)
    coding = rng.normal(58, 20, n).clip(0, 100)
    communication = rng.normal(66, 15, n).clip(0, 100)
    dsa = rng.normal(55, 22, n).clip(0, 100)
    projects = rng.poisson(2.0, n).clip(0, 8)
    internships = rng.poisson(0.6, n).clip(0, 4)
    certs = rng.poisson(1.5, n).clip(0, 8)
    courses = rng.poisson(2.0, n).clip(0, 10)
    skills = rng.poisson(5.0, n).clip(0, 18)
    languages = rng.poisson(2.0, n).clip(0, 8)

    readiness = (
        cgpa * 5.2
        + aptitude * 0.16
        + coding * 0.22
        + communication * 0.12
        + dsa * 0.18
        + projects * 2.2
        + internships * 4.5
        + certs * 0.9
        + courses * 0.6
        + skills * 0.9
        + languages * 0.7
        - backlogs * 5.0
        + rng.normal(0, 8, n)
    )
    placement_probability = 1 / (1 + np.exp(-(readiness - 78) / 10))
    placed = rng.binomial(1, placement_probability)
    package = (
        2.2
        + cgpa * 0.45
        + coding * 0.035
        + dsa * 0.025
        + internships * 0.9
        + projects * 0.35
        + skills * 0.11
        - backlogs * 0.35
        + rng.normal(0, 1.2, n)
    ).clip(2.0, 34.0)
    return pd.DataFrame(
        {
            "cgpa": cgpa,
            "tenth_percentage": tenth,
            "twelfth_percentage": twelfth,
            "backlog_count": backlogs,
            "aptitude_score": aptitude,
            "coding_score": coding,
            "communication_score": communication,
            "dsa_score": dsa,
            "project_count": projects,
            "internship_count": internships,
            "certification_count": certs,
            "course_count": courses,
            "technical_skill_count": skills,
            "language_count": languages,
            "placed": placed,
            "package_lpa": package,
        }
    )


def rmse(y_true, y_pred) -> float:
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def train_regression(frame: pd.DataFrame, features: list[str], target: str, artifact_name: str) -> None:
    x_train, x_test, y_train, y_test = train_test_split(frame[features], frame[target], test_size=0.2, random_state=12)
    candidates = {
        "baseline_mean": DummyRegressor(strategy="mean"),
        "ridge": Pipeline([("scale", StandardScaler()), ("model", Ridge(alpha=1.0))]),
        "random_forest": RandomForestRegressor(n_estimators=140, random_state=12, min_samples_leaf=4),
        "gradient_boosting": GradientBoostingRegressor(random_state=12),
    }
    results = {}
    best_name = ""
    best_model = None
    best_rmse = float("inf")
    for name, model in candidates.items():
        model.fit(x_train, y_train)
        preds = model.predict(x_test)
        metrics = {
            "mae": float(mean_absolute_error(y_test, preds)),
            "mse": float(mean_squared_error(y_test, preds)),
            "rmse": rmse(y_test, preds),
            "r2": float(r2_score(y_test, preds)),
        }
        results[name] = metrics
        if metrics["rmse"] < best_rmse:
            best_rmse = metrics["rmse"]
            best_name = name
            best_model = model

    artifact = {
        "version": VERSION,
        "model_name": best_name,
        "model": best_model,
        "features": features,
        "target": target,
        "metrics": results[best_name],
        "dataset": "synthetic_prototype",
    }
    joblib.dump(artifact, MODEL_DIR / artifact_name)
    (MODEL_DIR / artifact_name.replace(".joblib", "_metrics.json")).write_text(
        json.dumps({"selected_model": best_name, "all_models": results, "version": VERSION}, indent=2),
        encoding="utf-8",
    )


def train_classifier(frame: pd.DataFrame, features: list[str], target: str, artifact_name: str) -> None:
    x_train, x_test, y_train, y_test = train_test_split(
        frame[features],
        frame[target],
        test_size=0.2,
        random_state=14,
        stratify=frame[target],
    )
    candidates = {
        "baseline_most_frequent": DummyClassifier(strategy="most_frequent"),
        "logistic_regression": Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=1000))]),
        "random_forest": RandomForestClassifier(n_estimators=160, random_state=14, min_samples_leaf=3),
        "gradient_boosting": GradientBoostingClassifier(random_state=14),
    }
    results = {}
    best_name = ""
    best_model = None
    best_f1 = -1.0
    for name, model in candidates.items():
        model.fit(x_train, y_train)
        preds = model.predict(x_test)
        average = "binary" if len(set(y_test)) == 2 else "weighted"
        metrics = {
            "accuracy": float(accuracy_score(y_test, preds)),
            "precision": float(precision_score(y_test, preds, average=average, zero_division=0)),
            "recall": float(recall_score(y_test, preds, average=average, zero_division=0)),
            "f1": float(f1_score(y_test, preds, average=average, zero_division=0)),
            "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
            "classification_report": classification_report(y_test, preds, zero_division=0, output_dict=True),
        }
        results[name] = metrics
        if metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            best_name = name
            best_model = model
    artifact = {
        "version": VERSION,
        "model_name": best_name,
        "model": best_model,
        "features": features,
        "target": target,
        "metrics": results[best_name],
        "dataset": "synthetic_prototype",
    }
    joblib.dump(artifact, MODEL_DIR / artifact_name)
    (MODEL_DIR / artifact_name.replace(".joblib", "_metrics.json")).write_text(
        json.dumps({"selected_model": best_name, "all_models": results, "version": VERSION}, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    academic = make_academic_dataset()
    placement = make_placement_dataset()
    academic.to_csv(DATA_DIR / "academic_prototype_synthetic.csv", index=False)
    placement.to_csv(DATA_DIR / "placement_prototype_synthetic.csv", index=False)

    train_regression(academic, ACADEMIC_FEATURES, "final_cgpa", "academic_cgpa.joblib")
    train_classifier(academic, ACADEMIC_FEATURES, "risk_label", "academic_risk.joblib")
    train_classifier(placement, PLACEMENT_FEATURES, "placed", "placement_classifier.joblib")
    train_regression(placement, PLACEMENT_FEATURES, "package_lpa", "package_regressor.joblib")
    print(f"Saved Gradient AI prototype model artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    main()
