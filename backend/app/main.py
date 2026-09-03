from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import install_exception_handlers
from app.core.rate_limit import SimpleRateLimitMiddleware
from app.db.init_db import create_database_schema, seed_reference_data
from app.db.session import SessionLocal


settings = get_settings()
logging.basicConfig(level=settings.log_level)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Student Academic and Career Intelligence API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SimpleRateLimitMiddleware)
install_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event("startup")
def on_startup() -> None:
    if settings.auto_create_tables:
        create_database_schema()
    db = SessionLocal()
    try:
        seed_reference_data(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gradient-ai-backend"}

