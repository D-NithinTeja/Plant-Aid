#!/bin/sh
set -e

echo "==> Running Alembic migrations..."
uv run alembic upgrade head

if [ "${AUTO_SEED:-true}" = "true" ]; then
    echo "==> Checking database seeding..."
    uv run python seed.py
fi

echo "==> Starting Plant-Aid FastAPI backend on 0.0.0.0:8000..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
