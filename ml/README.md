# Gradient AI ML

The current ML layer uses deterministic synthetic prototype datasets for development and integration. These datasets are not presented as real student records and must be replaced with institution-approved historical data before production claims are made.

## Pipelines

Train all current artifacts:

```bash
python ml/scripts/train_all.py
```

Evaluate saved artifacts:

```bash
python ml/evaluation/evaluate_artifacts.py
```

Generated artifacts:

- `ml/models/academic_cgpa.joblib`
- `ml/models/academic_risk.joblib`
- `ml/models/placement_classifier.joblib`
- `ml/models/package_regressor.joblib`
- `ml/models/*_metrics.json`

## Targets

- CGPA prediction: regression target, synthetic prototype final CGPA.
- Academic risk: derived classification target from attendance, IA performance, prior CGPA, weak-subject count, and trend.
- Placement prediction: supervised prototype binary classification target.
- Package prediction: regression target for expected LPA in the prototype dataset.

Risk and readiness labels are application-defined advisory outputs, not scientific or psychometric claims.

