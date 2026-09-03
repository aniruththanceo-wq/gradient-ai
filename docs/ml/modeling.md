# ML Modeling Notes

Date: 2026-08-12

Gradient AI currently ships with reproducible synthetic prototype datasets so the application can be developed end to end without pretending to have real institutional records.

## Feature Sets

Academic CGPA and risk features:

- 10th percentage
- 12th percentage
- previous CGPA
- previous SGPA
- attendance percentage
- weekday study hours
- weekend study hours
- average IA percentage
- average IA trend
- weak subject count

Placement features:

- CGPA
- 10th and 12th percentages
- backlog count
- aptitude, coding, and communication scores
- DSA preparation score
- project, internship, certification, and course counts
- technical skill and programming language counts

## IA Trend Method

Subject IA trend uses a linear regression slope over assessment index. Slope thresholds classify the trend as improving, declining, stable, or fluctuating. A separate fluctuation check looks for sign changes and meaningful spread so unstable subjects are not mislabeled as simply stable.

## Academic Risk Labels

The prototype risk target is derived from:

- low prior CGPA
- attendance below 75%
- low IA average
- declining IA trend
- weak-subject count

The labels are advisory application targets, not ground truth. When real data is available, labels should be reviewed with academic stakeholders.

## Limitations

- Synthetic data is useful for integration and validation of code paths only.
- Metrics are not production claims.
- No confidence percentages are exposed.
- Before production deployment, replace data generation with a documented historical dataset, review feature consent/privacy, and rerun model selection.

