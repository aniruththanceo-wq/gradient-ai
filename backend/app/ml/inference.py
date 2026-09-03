from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

from app.core.config import get_settings


class ModelArtifactMissingError(RuntimeError):
    pass


@lru_cache(maxsize=8)
def _load_artifact(name: str) -> dict:
    path = Path(get_settings().model_path) / name
    if not path.exists():
        raise ModelArtifactMissingError(
            f"Missing model artifact {path}. Run `python ml/scripts/train_all.py` before using this endpoint."
        )
    return joblib.load(path)


def predict_artifact(artifact_name: str, features: dict):
    artifact = _load_artifact(artifact_name)
    columns = artifact["features"]
    frame = pd.DataFrame([{key: features.get(key, 0) for key in columns}])
    prediction = artifact["model"].predict(frame)[0]
    return prediction, artifact


def predict_probability(artifact_name: str, features: dict) -> tuple[float, dict]:
    artifact = _load_artifact(artifact_name)
    columns = artifact["features"]
    frame = pd.DataFrame([{key: features.get(key, 0) for key in columns}])
    model = artifact["model"]
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(frame)[0][-1])
    else:
        probability = float(model.predict(frame)[0])
    return probability, artifact

