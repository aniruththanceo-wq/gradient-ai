# Gradient AI — Engineering Handoff & Architecture Guide

## 1. System Overview
**Gradient AI** is an intelligent university student copilot that unifies academic trajectory analytics, IA linear regression slope calculations, ML-driven CGPA and risk predictions, weak-subject-aware exam timetable generation, career portfolio tracking, multi-category timed assessments (Aptitude, Safe Static Coding, Communication), placement probability forecasting, and downloadable server-compiled PDF dossiers.

---

## 2. Strict Academic Year Gating Rule
The platform strictly enforces year-based feature accessibility across both frontend routing/UI and backend API dependencies:
- **Year 1 & Year 2 (Academic Focus)**:
  - Allowed: Academic profile, dynamic subject manager, flexible IA test tracking, regression slope trends, weak subject diagnosis, attendance alerts (<75%), ML CGPA & risk prediction, exam timetable generator, and Academic Intelligence PDF reports.
  - Locked (HTTP 403 Forbidden): Placement profile, engineering projects, internships, certifications, coursework, aptitude/coding/communication assessments, placement predictions, company preparation, and placement reports.
- **Year 3 & Year 4 (Academic + Placement)**:
  - Full access to all academic tools plus the complete Career Intelligence suite.

---

## 3. Technology Stack & Key Directories

### A. Frontend
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailored design tokens (Forest Emerald, Slate Pine, Sand, Crimson Alert) in `frontend/app/globals.css`
- **Charts**: Recharts (`LineChart` for multi-subject trajectories, `RadarChart` for 6-dimension placement readiness)
- **Icons**: Lucide React
- **Routes**:
  - `/`: Long-form public landing page with interactive IA & attendance forecast simulator.
  - `/onboarding`: 2-step guided onboarding wizard with year selection and feature preview.
  - `/dashboard`: Personalized command center (KPIs, weak subject alerts, next actions).
  - `/academic`: Subject & flexible IA manager, regression slopes, CGPA forecast, exam timetable solver.
  - `/placement`: Placement profile, portfolio manager, 20Q Aptitude test, 30m safe coding workbench, 15Q Communication test, readiness radar, target company roadmaps.
  - `/reports`: Server-compiled PDF generation and direct downloads.

### B. Backend
- **Framework**: FastAPI (Python 3.12+)
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (development fallback) and PostgreSQL support.
- **PDF Engine**: ReportLab 4.4 / 5.0 compiling verified A4 documents to `reports/generated/`.
- **Authentication**: Google OAuth verification (`POST /api/v1/auth/google`) + Development Persona mode (`POST /api/v1/auth/dev-login`).

### C. Machine Learning Pipeline (`ml/`)
- **Trained Artifacts** in `ml/models/`:
  - `academic_cgpa.joblib`: Ridge Regressor predicting final CGPA from historical, IA, and attendance features.
  - `academic_risk.joblib`: Gradient Boosting Classifier categorizing Low, Moderate, High, or Critical risk.
  - `placement_classifier.joblib`: Logistic Regression classifier evaluating placement probability.
  - `package_regressor.joblib`: Ridge Regressor estimating expected CTC (LPA).
- **Training Pipeline**: `ml/scripts/train_all.py`
- **Feature Engineering**: `ml/feature_engineering/features.py`

---

## 4. How to Run Locally

### Backend
```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
API Documentation available at: `http://localhost:8000/docs`

### Frontend
```powershell
cd frontend
npm run dev
```
Application available at: `http://localhost:3000`

### Running Test Suites
- **Backend Tests**: `backend\.venv\Scripts\pytest backend/tests -v`
- **Frontend Tests**: `cd frontend && npm run test`
- **Frontend Build**: `cd frontend && npm run build`
