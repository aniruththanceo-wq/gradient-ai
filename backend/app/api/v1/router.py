from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import academic, auth, placement, profile, reports


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(academic.router)
api_router.include_router(placement.router)
api_router.include_router(reports.router)

