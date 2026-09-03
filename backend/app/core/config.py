from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Gradient AI"
    api_prefix: str = "/api/v1"
    environment: str = "development"
    log_level: str = "INFO"

    database_url: str = "sqlite+pysqlite:///./gradient_ai_dev.db"
    auto_create_tables: bool = True

    google_client_id: str = ""
    google_client_secret: str = ""

    session_secret: str = Field(default="development-only-change-me", min_length=16)
    session_cookie_name: str = "gradient_ai_session"
    session_cookie_samesite: str = "lax"
    session_cookie_secure: bool | None = None
    session_expire_minutes: int = 60 * 24 * 7

    frontend_origin: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000"

    model_dir: str = "../ml/models"
    pdf_output_dir: str = "reports/generated"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def normalized_database_url(self) -> str:
        """Normalizes cloud PostgreSQL connection strings (e.g. Render/Supabase postgres://) to SQLAlchemy 2.0 psycopg."""
        url = self.database_url.strip()
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        if url.startswith("postgresql://") and "+psycopg" not in url and "+asyncpg" not in url:
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def cookie_secure(self) -> bool:
        if self.session_cookie_secure is not None:
            return self.session_cookie_secure
        return self.is_production or self.session_cookie_samesite.lower() == "none"

    @property
    def cookie_samesite(self) -> str:
        return self.session_cookie_samesite.lower()

    @property
    def model_path(self) -> Path:
        configured = Path(self.model_dir)
        if configured.is_absolute() and configured.exists():
            return configured
        if configured.exists():
            return configured.resolve()
        # Fallback to relative to this file's repo root (standard monorepo layout)
        repo_ml = Path(__file__).resolve().parents[3] / "ml" / "models"
        if repo_ml.exists():
            return repo_ml
        # Fallback to local container/app ml/models
        app_ml = Path(__file__).resolve().parents[2] / "ml" / "models"
        if app_ml.exists():
            return app_ml
        current_ml = Path(__file__).resolve().parents[1] / "ml" / "models"
        if current_ml.exists():
            return current_ml
        return configured.resolve()

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
