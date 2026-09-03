# Gradient AI — Student Academic & Career Intelligence

Gradient AI is an authenticated student intelligence platform engineered for university engineering programs. It delivers internal assessment (IA) trajectory tracking, linear regression trend analytics, scikit-learn CGPA and academic risk forecasting, constraint-based exam study timetables, placement readiness radar evaluations, and downloadable ReportLab PDF dossiers.

---

## System Architecture

```
gradient-ai/
├── frontend/             # Next.js 16 (App Router), TypeScript, Design Token CSS (Zero CSS bloat)
├── backend/              # FastAPI, SQLAlchemy 2.0, Alembic, ReportLab, Pydantic v2
├── ml/                   # Scikit-learn pipelines, trained .joblib artifacts & evaluation scripts
├── docs/                 # System architecture, API documentation, and handoff guides
├── .env.example          # Comprehensive template for all environment configurations
└── docker-compose.yml    # Local PostgreSQL service definition
```

### Core Business Logic: Strict Year-Based Access Control
- **Year 1 & 2 (Academic Focus)**: Academic Records, IA Multi-Subject Trends, CGPA & Risk ML Forecaster, Constraint-Based Exam Timetable, Academic PDF Dossier. Direct backend access to Placement endpoints is restricted (`HTTP 403 Forbidden`).
- **Year 3 & 4 (Academic + Career Suite)**: Full Academic Suite + Placement Profile, Portfolio Artifacts CRUD (Projects, Internships, Certifications, Courses), 20Q Aptitude Test, 30m Safe Static Coding Assessment, 15Q Communication Test, 6-Dimension Readiness Radar, Target Company Strategy Roadmaps (Google, Amazon, Microsoft, Meta, OpenAI), and Placement PDF Dossier.

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v20 or newer (v22+ recommended)
- **Python**: 3.11 or 3.12+
- **Database**: PostgreSQL 15+ (or SQLite default for local zero-config testing)

### 2. Environment Setup
Copy the configuration template:
```bash
cp .env.example .env
```

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## Production Deployment Guide

### A. Database Deployment (Managed PostgreSQL)
Deploy a managed PostgreSQL database using **Neon**, **Supabase**, **Render Postgres**, or **Railway**:
1. Create a new PostgreSQL instance (Postgres 15 or 16).
2. Obtain the connection string URI. Format:
   `postgresql+psycopg://user:password@host:5432/dbname`
3. Run migrations against your production database:
   ```bash
   DATABASE_URL="your-production-db-url" alembic upgrade head
   ```

### B. Backend Deployment (FastAPI on Render / Railway / Fly.io)
1. **Repository Link**: Connect your repository to Render/Railway.
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   | Variable | Value Description | Example |
   | :--- | :--- | :--- |
   | `ENVIRONMENT` | Must be set to `production` | `production` |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://...` |
   | `SESSION_SECRET` | 32+ character random secret | `generate with secrets.token_hex(32)` |
   | `FRONTEND_ORIGIN` | Your deployed frontend URL | `https://gradient-ai.vercel.app` |
   | `CORS_ORIGINS` | Comma-separated allowed origins | `https://gradient-ai.vercel.app` |
   | `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | `*.apps.googleusercontent.com` |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth Web Client Secret | `GOCSPX-...` |
   | `AUTO_CREATE_TABLES` | Auto-seed reference data on boot | `true` |
   | `MODEL_DIR` | Relative path to ML artifacts | `../ml/models` |
   | `SESSION_COOKIE_SAMESITE`| Cross-site cookie policy | `none` (if frontend & backend on different domains) |

### C. Frontend Deployment (Next.js on Vercel)
1. **Import Project**: Import your repository into **Vercel**.
2. **Root Directory**: Select `frontend`.
3. **Framework Preset**: `Next.js`
4. **Environment Variables**:
   | Variable | Value Description | Example |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_BASE_URL` | Your deployed backend URL | `https://gradient-ai-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Google OAuth Client ID | `*.apps.googleusercontent.com` |
5. **Deploy**: Trigger the build. Next.js will compile static and client assets.

### D. Google Cloud OAuth 2.0 Configuration
1. Open the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (Local testing)
   - `https://gradient-ai.vercel.app` (Production URL)
4. Copy the Client ID to `GOOGLE_CLIENT_ID` (backend) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend).

---

## Automated Verification & Test Commands

```bash
# Run all backend unit and security tests
cd backend
pytest tests -v

# Run all frontend component and year-gating tests
cd frontend
npm test

# Run Next.js production build and TypeScript check
cd frontend
npm run build
```

---

## Data & Machine Learning Disclosure
- The included ML models (`academic_cgpa.joblib`, `academic_risk.joblib`, `placement_classifier.joblib`, `package_regressor.joblib`) were trained on controlled synthetic prototype distributions for development and integration benchmarking.
- Gradient AI never promises or guarantees salary packages or placement outcomes.
- Coding assessment submissions are analyzed safely using static rubric inspection without unsafe server-side execution.
