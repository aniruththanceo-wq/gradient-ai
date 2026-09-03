# Database Migrations

Gradient AI uses Alembic for PostgreSQL schema migrations.

For local development, `AUTO_CREATE_TABLES=true` lets FastAPI create tables automatically so the app starts quickly. For shared environments and production, set `AUTO_CREATE_TABLES=false` and run:

```bash
cd backend
alembic upgrade head
```

Generate a new migration after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

