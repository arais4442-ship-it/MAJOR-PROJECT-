# Code Change Log

This file tracks all code changes, additions, refactorings, and bug fixes made in this codebase across all development turns.

---

## 📋 Change History Ledger

| Date & Time (ISO) | Author / System | Files Affected | Category | Summary of Changes |
| :--- | :--- | :--- | :--- | :--- |
| 2026-08-19 14:30:00 | AI Assistant | `backend/.env`, `backend/scripts/ingest_argo.py`, `oceaniq.db` | Refactoring / DB Fix | Transitioned backend database to SQLite caching and resolved SQL primary key get() bug in seed script. |
| 2026-08-19 12:02:00 | AI Assistant | `frontend/src/components/VisualizationPanel.jsx`, `frontend/src/components/ChatInterface.jsx` | Visual / UI Feature | Integrated glowing sci-fi ARGO float telemetry schematics into EmptyState and Chat Welcome layouts. |
| 2026-08-14 15:33:00 | AI Assistant | `frontend/src/components/SourceCitations.jsx` | Bug Fix | Fixed JS syntax error (replaced `return None` with `return null`) |
| 2026-08-14 15:08:00 | AI Assistant | `backend/*`, `frontend/*`, `docker-compose.yml` | Feature | Implemented complete OceanIQ backend & Next.js frontend |
| 2026-08-14 15:03:00 | AI Assistant | `Commands.md`, `memory.md`, `code_change.md` | Chore | Initialized project tracking files |

---

## 🔍 Detailed Change Records

### Change Record #3 — [2026-08-19] ARGO Telemetry Blueprint Visuals Integration
- **Author**: Antigravity AI Assistant
- **Category**: Visual / UI enhancement
- **Files Created / Modified**:
  - `frontend/public/images/argo-schematic.png` (Created)
  - `frontend/src/components/VisualizationPanel.jsx` (Modified)
  - `frontend/src/components/ChatInterface.jsx` (Modified)
- **Description**:
  - Generated and saved a custom scientific ARGO float blueprint illustration matching the dashboard's Cybertronian style.
  - Implemented the schematic illustration as a dynamic placeholder on the chat welcome console.
  - Replaced the simple emoji placeholder under the main chart area (`EmptyState`) with the telemetry blueprint as a background stencil and main focal point.
- **Rationale**: Elevate user experience aesthetics by making empty/default dashboard states look cohesive and high-tech rather than bare.

### Change Record #2 — [2026-08-14] OceanIQ Full-Stack System Implementation
- **Author**: Antigravity AI Assistant
- **Category**: Feature / Full-Stack Implementation
- **Files Created / Modified**:
  - [`docker-compose.yml`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/docker-compose.yml)
  - [`backend/requirements.txt`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/requirements.txt)
  - [`backend/.env`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/.env)
  - [`backend/app/config.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/config.py)
  - [`backend/app/db/session.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/db/session.py)
  - [`backend/app/db/models.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/db/models.py)
  - [`backend/scripts/ingest_argo.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/scripts/ingest_argo.py)
  - [`backend/app/nlp/ner_extractor.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/nlp/ner_extractor.py)
  - [`backend/app/nlp/intent_classifier.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/nlp/intent_classifier.py)
  - [`backend/app/nlp/llm_fallback.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/nlp/llm_fallback.py)
  - [`backend/app/retrieval/sql_builder.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/retrieval/sql_builder.py)
  - [`backend/app/retrieval/chroma_search.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/retrieval/chroma_search.py)
  - [`backend/app/ml/lstm_model.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/ml/lstm_model.py)
  - [`backend/app/core/confidence.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/core/confidence.py)
  - [`backend/app/nlg/template_nlg.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/nlg/template_nlg.py)
  - [`backend/app/api/routes.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/api/routes.py)
  - [`backend/app/main.py`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/backend/app/main.py)
  - [`frontend/package.json`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/package.json)
  - [`frontend/next.config.mjs`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/next.config.mjs)
  - [`frontend/tailwind.config.js`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/tailwind.config.js)
  - [`frontend/postcss.config.js`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/postcss.config.js)
  - [`frontend/src/app/globals.css`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/app/globals.css)
  - [`frontend/src/app/layout.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/app/layout.jsx)
  - [`frontend/src/app/page.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/app/page.jsx)
  - [`frontend/src/components/Header.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/components/Header.jsx)
  - [`frontend/src/components/ChatInterface.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/components/ChatInterface.jsx)
  - [`frontend/src/components/PlotlyChart.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/components/PlotlyChart.jsx)
  - [`frontend/src/components/MapView.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/components/MapView.jsx)
  - [`frontend/src/components/SourceCitations.jsx`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/frontend/src/components/SourceCitations.jsx)
  - [`Commands.md`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/Commands.md)
  - [`memory.md`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/memory.md)
- **Description**:
  - Implemented containerized PostgreSQL 15 + PostGIS docker compose setup.
  - Implemented FastAPI backend server with SQLAlchemy ORM models, PostGIS geometry support, and automatic ARGO profile ingestion.
  - Built spaCy NER extractor, scikit-learn intent classifier, parameterized SQL query generator, and zero-hallucination Jinja2/f-string template NLG.
  - Implemented PyTorch `OceanLSTM` neural network module for trajectory and parameter forecasting.
  - Built Next.js 14 App Router frontend dashboard with dynamic Plotly visualizations, Leaflet interactive maps, Chat console, and Source Citations sidebar.
  - Updated `Commands.md`, `memory.md`, and `code_change.md`.
- **Rationale**: Fulfill PRD and Tech Stack specifications for OceanIQ using a zero-hallucination structured retrieval core with Next.js App Router UI.

---

### Change Record #1 — [2026-08-14] Project Initialization
- **Author**: Antigravity AI Assistant
- **Category**: Chore / Documentation
- **Files Created**:
  - [`Commands.md`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/Commands.md)
  - [`memory.md`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/memory.md)
  - [`code_change.md`](file:///c:/Users/moham/OneDrive/Desktop/COLLAGE%20PROJECTS/code_change.md)
- **Description**:
  - Created `Commands.md` to serve as a command index and reference sheet for project CLI commands.
  - Created `memory.md` to act as persistent memory for technical decisions, project state, and active roadmaps.
  - Created `code_change.md` to continuously log every code change, patch, and file modification.
- **Rationale**: Ensure clear project auditability, persistent context tracking, and command reference across development sessions.

---

### Change Record #4 — [2026-08-19] SQLite Engine Migration & Seeding Code Bugfix
- **Author**: Antigravity AI Assistant
- **Category**: Refactoring & Database Bugfix
- **Files Created / Modified**:
  - `backend/.env` (Modified)
  - `backend/scripts/ingest_argo.py` (Modified)
  - `oceaniq.db` (Recreated)
- **Description**:
  - Changed `DATABASE_URL` and `SYNC_DATABASE_URL` in `.env` to target SQLite as the primary database cache, as Docker (and thus PostgreSQL) is not installed on user's workspace system.
  - Fixed query lookup inside `backend/scripts/ingest_argo.py` to query for `wmo_id` uniqueness using `select()` instead of calling `session.get(ArgoFloat, ...)` (which erroneously used the string `wmo_id` as the primary key rather than the integer `id` field).
  - Deleted the outdated SQLite DB cache (`oceaniq.db`) and successfully seeded a fresh, correctly Structured SQLite database with 500 days of ARGO profile telemetry measurements.
- **Rationale**: Ensure full application readiness and execution capability in local environments that lack Docker/PostgreSQL containers.

