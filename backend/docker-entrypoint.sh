#!/bin/sh
set -e

echo "==> Running Alembic migrations..."
python -m alembic upgrade head

echo "==> Checking database seeding..."
python seed.py

echo "==> Starting Plant-Aid FastAPI backend on 0.0.0.0:8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
