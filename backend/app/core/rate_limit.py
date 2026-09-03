from __future__ import annotations

from collections import defaultdict, deque
from time import monotonic
from typing import Deque

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


class SimpleRateLimitMiddleware(BaseHTTPMiddleware):
    """Small in-memory guard for sensitive endpoints in single-process deployments."""

    def __init__(self, app, max_requests: int = 30, window_seconds: int = 60) -> None:
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path.endswith("/auth/google"):
            key = request.client.host if request.client else "unknown"
            now = monotonic()
            hits = self._hits[key]
            while hits and now - hits[0] > self.window_seconds:
                hits.popleft()
            if len(hits) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={"error": {"code": "rate_limited", "message": "Please wait before trying again."}},
                )
            hits.append(now)
        return await call_next(request)

