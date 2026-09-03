from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "ml" / "models"


def main() -> None:
    metric_files = sorted(MODEL_DIR.glob("*_metrics.json"))
    if not metric_files:
        raise SystemExit("No metrics files found. Run `python ml/scripts/train_all.py` first.")
    summary = {}
    for path in metric_files:
        summary[path.name] = json.loads(path.read_text(encoding="utf-8"))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()

