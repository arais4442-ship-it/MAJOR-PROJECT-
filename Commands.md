# Project Commands Reference

This file logs common commands, build scripts, package manager commands, and environment setup commands for the OceanIQ project.

---

## 🚀 General & Setup Commands
- **Docker PostGIS DB**: `docker-compose up -d`
- **Backend Setup & Run**:
  - Install backend dependencies: `pip install -r backend/requirements.txt`
  - Seed DB with ARGO profiles: `python backend/scripts/ingest_argo.py`
  - Start FastAPI server: `uvicorn backend.app.main:app --reload --port 8000`
- **Frontend (Next.js) Setup & Run**:
  - From root folder: `npm --prefix frontend install` then `npm run dev`
  - Or navigate into directory: `cd frontend && npm install && npm run dev`

## 🛠️ Testing & Linting
- **Run Backend Tests**: `pytest backend/`
- **Run Frontend Linter**: `cd frontend && npm run lint`

## 📦 Git & Version Control
- **Check Status**: `git status`
- **Commit Changes**: `git commit -m "feat: description"`
- **Push Branch**: `git push origin main`

## 📝 Utility & Custom Commands

| Command | Category | Description |
| :--- | :--- | :--- |
| `docker-compose up -d` | Infra | Spin up PostGIS PostgreSQL 15 container |
| `python backend/scripts/ingest_argo.py` | Data | Seed database with ARGO float profiles |
| `uvicorn backend.app.main:app --reload` | Backend | Launch FastAPI backend server |
| `npm run dev` | Frontend | Launch Next.js App Router UI dashboard |

