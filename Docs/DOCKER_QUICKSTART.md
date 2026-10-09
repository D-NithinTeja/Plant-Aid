# Docker Compose Quick-Start Guide

This guide describes how to start the Plant-Aid application using Docker Compose with minimal configuration.

---

## 1. Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) (v24.0+ recommended)
- [Docker Compose](https://docs.docker.com/compose/) (Compose V2)

Verify your installation:
```bash
docker compose version
```

---

## 2. Quick Start

### Step 1: Clone and Configure Environment

Copy the example environment configuration into the repository root:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### Step 2: Build and Run Services

Run both backend and frontend services:
```bash
docker compose up --build
```

To run in detached (background) mode:
```bash
docker compose up -d --build
```

To run **only the backend** service:
```bash
docker compose up --build backend
```

---

## 3. Service Access

Once running, the following endpoints are available:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost](http://localhost) (Port 80) | React single-page application |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI REST service |
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API documentation |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Service health check |

---

## 4. Automatic Initialization & Migrations

When the backend container starts, `backend/docker-entrypoint.sh` automatically performs:
1. **Alembic Database Migrations**: Runs `python -m alembic upgrade head` to apply all latest schema migrations.
2. **Database Seeding**: Runs `python seed.py` to seed groundnut disease definitions, remedies, and reference data.
3. **Application Server**: Starts the Uvicorn ASGI server with workers bound to `0.0.0.0:8000`.

---

## 5. Persistent Storage & Volumes

Data persists across container restarts using Docker named volumes:

- `plant_aid_backend_data`: Stores the SQLite database file (`/app/data/plant_aid.db`).
- `plant_aid_backend_uploads`: Stores disease detection scan photos and heatmaps (`/app/uploads/`).

---

## 6. Daily Operations & Troubleshooting

### Inspecting Logs
Follow real-time logs for all services:
```bash
docker compose logs -f
```

Follow logs for backend only:
```bash
docker compose logs -f backend
```

### Checking Service Health
```bash
docker compose ps
```

### Restarting Services
Restart a specific service:
```bash
docker compose restart backend
```

### Stopping Services
Stop running containers without removing stored database data:
```bash
docker compose down
```

### Resetting Persistent Data
To perform a complete clean slate (wiping persistent database and uploaded media volumes):
```bash
docker compose down -v
```
Re-running `docker compose up --build` will recreate and reseed fresh database volumes.
