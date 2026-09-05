# 🌊 OceanIQ — Hybrid Retrieval-First ARGO Ocean Data Platform

> **A Hybrid Retrieval-First Conversational Interface for ARGO Ocean Data Discovery, Visualization, and Forecasting**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 1. Overview & Problem Statement

### The Challenge
Global ocean data collected by autonomous **ARGO floats** (temperature, salinity, pressure, biogeochemical parameters) is traditionally stored in complex NetCDF formats accessible only via specialist tools such as ERDDAP or Ocean Data View (ODV). This creates a steep barrier for non-technical researchers, educators, policymakers, and students who require quick oceanographic insights without writing custom data-extraction scripts.

Existing conversational AI systems in oceanography often rely solely on generative LLMs or vector-based RAG on numeric data. This introduces:
- **Hallucination Risk**: Generating plausible but inaccurate numeric ocean temperatures or salinity values.
- **High Operational Costs**: Heavy reliance on external API keys or GPU-bound local LLMs.
- **Deferred Capabilities**: Forecasting functions left as hypothetical "future work."

### The OceanIQ Solution
**OceanIQ** addresses these challenges using a **retrieval-first, structured-query-primary architecture**:
1. **Classical NLP & Structured SQL Engine**: Defaults to spaCy NER, TF-IDF/SVM intent routing, and parameter-bound NL-to-SQL querying against a PostgreSQL/PostGIS backend.
2. **Zero-Hallucination Template NLG**: Guarantees ~0% hallucination on numeric queries by composing responses strictly from DB query results.
3. **Optional LLM Fallback**: Uses Gemini API only for low-confidence classifications or conversational general knowledge.
4. **Delivered LSTM Forecasting**: Ships an operational PyTorch-based LSTM forecasting model for temperature trends and float trajectories.
5. **Full Traceability**: Every response details its data provenance (WMO float IDs, coordinates, quality control flags, and profile counts).

---

## ✨ 2. Key Features

- 💬 **Conversational Data Querying**: Query ocean parameters in plain English (e.g., *"Show temperature trends in the Arabian Sea at 50m depth during monsoon"*).
- 🗺️ **Interactive Geospatial Visualization**: Render ARGO float locations, depth profiles, and time-series trends dynamically using **Leaflet.js** and **Plotly.js**.
- 📈 **LSTM Predictive Analytics**: Forecast oceanographic trends and trajectory paths with clear confidence metrics.
- ⚡ **Z-Score Anomaly Detection**: Automatically flag statistical anomalies (mild vs. severe z-score deviances) in temperature and salinity profiles.
- 🔄 **Live ARGO GDAC Synchronization**: Background scheduler periodically syncs live float telemetry via `argopy` and `xarray`.
- 📁 **Data Export & Source Citations**: Download customized parameter subsets in `.csv` format and inspect complete WMO float provenance for every query response.
- 🛡️ **Cyber HUD Interface**: Futuristic glassmorphic UI equipped with status indicators, audio cues, and account space management.

---

## 🏗️ 3. System Architecture & Data Flow

```mermaid
graph TD
    User([User / Browser]) <--> ReactUI[Next.js App Router / Cyber HUD]
    ReactUI <--> FastAPI[FastAPI Backend Server]
    
    subgraph Query Intelligence
        FastAPI --> Router[Intent Router & spaCy NER]
        Router -->|High Confidence| SQLBuilder[NL-to-SQL Generator]
        Router -->|Low Confidence / Conversational| LLM[Gemini LLM Fallback]
    end
    
    subgraph Data & Storage Layer
        SQLBuilder --> PostGIS[(PostgreSQL / PostGIS)]
        GDAC[ARGO GDAC] -->|argopy / xarray| Sync[Sync Scheduler] --> PostGIS
    end
    
    subgraph Analytics & Intelligence
        PostGIS --> LSTM[LSTM Forecasting Engine]
        PostGIS --> Anomaly[Z-Score Anomaly Detection]
        PostGIS --> Confidence[Confidence & Provenance Evaluator]
    end
    
    subgraph Response Assembly
        Confidence --> NLG[Template NLG / Visualizer]
        LLM --> NLG
        LSTM --> NLG
        NLG --> Response[Structured JSON Response]
    end
    
    Response --> ReactUI
```

### Data Flow Breakdown
1. **Intake**: Natural language input is transmitted from the Next.js frontend to the FastAPI `/api/v1/query` endpoint.
2. **Intent Classification & Entity Extraction**: spaCy extracts spatial coordinates, parameter names (temperature, salinity, pressure, dissolved oxygen), depth layers, and timeframes.
3. **Execution Path**:
   - **Deterministic Path (Default)**: Constructs a parameterized SQL query to execute against PostgreSQL/PostGIS. Outputs are formatted with **Template NLG**.
   - **LLM Fallback Path**: Engaged only when intent confidence drops below 0.65 or for general domain inquiries.
4. **Enrichment**: Computes confidence scores, pulls WMO Float IDs & Quality Control (QC) status, and runs PyTorch LSTM inference if forecasting is requested.
5. **Visualization**: Returns data formatted for Plotly charts and Leaflet maps to the user dashboard.

---

## 🛠️ 4. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router) / React 18
- **Styling**: Tailwind CSS & Glassmorphism Design System
- **Mapping**: Leaflet.js / React-Leaflet
- **Charts**: Plotly.js / React-Plotly
- **Icons & UI**: Lucide-React, Framer Motion

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn ASGI
- **NLP Pipeline**: spaCy (`en_core_web_sm`), scikit-learn (TF-IDF + SVM), sentence-transformers (`all-MiniLM-L6-v2`)
- **Data Ingestion**: `argopy`, `xarray`, `pandas`, `netCDF4`
- **Forecasting**: PyTorch (LSTM Network)
- **LLM Integration**: Google Generative AI (`gemini-2.5-flash`)

### Database & Infrastructure
- **Database**: PostgreSQL 15 with **PostGIS** geospatial extensions
- **ORM / Migrations**: SQLAlchemy (Async Engine) & Alembic
- **Containerization**: Docker Compose

---

## 📡 5. Primary API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/query` | Primary conversational query engine (returns text, chart data, map points, citations, anomalies) |
| `GET` | `/api/v1/stats` | System dashboard telemetry (float count, active profiles, total observations, sync state) |
| `GET` | `/api/v1/live/floats` | Retrieves latest spatial coordinates and metadata for all active ARGO floats |
| `POST` | `/api/v1/live/sync` | Manually triggers live synchronization with GDAC servers |
| `GET` | `/api/v1/floats` | Returns listing of all tracked ARGO floats and profile counts |
| `GET` | `/api/v1/floats/{wmo_id}` | Detailed float history and cycle profiles |
| `GET` | `/api/v1/profiles/{id}` | In-depth profile measurement table across depth layers |
| `GET` | `/api/v1/anomalies` | Returns statistical z-score anomalies for selected parameters |
| `GET` | `/api/v1/export/csv` | Streams parameter dataset export in `.csv` format |
| `POST` | `/api/v1/feedback` | Logs user rating and query correction data for retrain cycles |

---

## 🚀 6. Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **Python**: `v3.10` or higher
- **Docker & Docker Desktop**: Installed and running

---

### Step 1: Database Setup (PostGIS)
Start the PostGIS container using Docker Compose:
```bash
docker-compose up -d
```
*This launches PostgreSQL with PostGIS on port `5432`.*

---

### Step 2: Backend Setup
1. Navigate into the backend directory and set up a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Download the spaCy language model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

4. Configure environment variables (`backend/.env`):
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/oceaniq
   GEMINI_API_KEY=your_gemini_api_key_here  # Optional: for LLM fallback
   ```

5. Seed the database with sample ARGO profiles:
   ```bash
   python backend/scripts/ingest_argo.py
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   *Swagger documentation is available at `http://localhost:8000/docs`.*

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the OceanIQ dashboard.

---

## 📊 7. Comparative Benchmark

| Feature | Generic LLM RAG | ODV / ERDDAP Scripts | OceanIQ Platform |
| :--- | :--- | :--- | :--- |
| **Query Mechanism** | Pure Natural Language | Manual Scripting / Complex UI | Natural Language & Visual Controls |
| **Numeric Accuracy** | Vulnerable to Hallucinations | 100% Accurate (Raw Data) | **100% Deterministic SQL / Template NLG** |
| **API / GPU Cost** | High (Per Token / GPU) | Zero | **Zero for Core Queries (Optional Fallback)** |
| **Data Provenance** | Opaque / Unverifiable | Exact NetCDF Files | **Full WMO ID, Coordinates, & QC Flags** |
| **Forecasting** | Hypothetical Text | Manual Model Coding | **Integrated PyTorch LSTM Engine** |
| **Setup Barrier** | Medium | High | **Low (Docker & Web UI)** |

---

## 📄 8. License & Acknowledgments

- Data sourced from the **ARGO Global Data Assembly Centre (GDAC)**.
- Built for accessible, zero-hallucination oceanographic intelligence.

---
*Created for the MAJOR-PROJECT- repository.*
