from __future__ import annotations

import os
from pathlib import Path

TEST_DB = Path(__file__).resolve().parent / "gradient_ai_test.db"
if TEST_DB.exists():
    TEST_DB.unlink()

os.environ.setdefault("DATABASE_URL", f"sqlite+pysqlite:///{TEST_DB.as_posix()}")
os.environ.setdefault("SESSION_SECRET", "test-session-secret-for-gradient-ai")
os.environ.setdefault("AUTO_CREATE_TABLES", "true")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
REPO_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = REPO_ROOT / "ml" / "models"
os.environ["MODEL_DIR"] = MODEL_PATH.as_posix()

