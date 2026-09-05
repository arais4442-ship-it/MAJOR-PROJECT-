# Tech Stack & Architecture Document

## Project: OceanIQ — Hybrid Retrieval-First ARGO Ocean Data Assistant

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                              User                                 │
└──────────────────────────────┬────────────────────────────────────┘
                                │
                                ▼
                  ┌──────────────────────────┐
                  │   React Frontend          │
                  │   Chat + Dashboard        │
                  └──────────────┬─────────────┘
                                │
                                ▼
                  ┌──────────────────────────┐
                  │   FastAPI Backend          │
                  └──────────────┬─────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │        Intent Router / Query Classifier      │
        │  spaCy NER + TF-IDF/SVM classifier +          │
        │  sentence-transformer template matching       │
        │  (LLM fallback only if confidence < threshold)│
        └───────────────────┬───────────────────────┘
                            │
        ┌───────────────────┼────────────────────────┐
        ▼                   ▼                          ▼
┌───────────────┐  ┌─────────────────┐      ┌─────────────────────┐
│  NL-to-SQL     │  │  Semantic Meta   │      │  LSTM Forecasting    │
│  Generator     │  │  Retrieval        │      │  Engine               │
│  (slot-filling │  │  (ChromaDB —     │      │  (trajectory /        │
│  + query       │  │  fuzzy location/ │      │  parameter forecast)  │
│  templates)    │  │  term matching   │      │                       │
└───────┬────────┘  │  only)           │      └───────────┬───────────┘
        │            └────────┬─────────┘                  │
        │                    │                             │
        └────────────────────┼─────────────────────────────┘
                              ▼
                ┌───────────────────────────┐
                │   PostgreSQL Ocean DB       │
                │   (+ PostGIS for geospatial)│
                └──────────────┬──────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  ARGO Dataset Ingestion     │
                │  (argopy + xarray + pandas) │
                └──────────────┬──────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  Confidence & Traceability   │
                │  Layer                        │
                │  — WMO float IDs              │
                │  — QC flags                   │
                │  — confidence score           │
                │  — profile count               │
                └──────────────┬──────────────┘
                              │
                ┌──────────────┴──────────────┐
                ▼                              ▼
      ┌───────────────────┐       ┌─────────────────────────┐
      │ Visualization Engine│       │ Response Generator        │
      │ Plotly + Leaflet     │       │ Template NLG (default)    │
      │                      │       │ ↳ Gemini API (fallback     │
      │                      │       │   on low confidence only) │
      └──────────┬───────────┘       └─────────────┬─────────────┘
                │                                  │
                └──────────────┬───────────────────┘
                              ▼
                ┌───────────────────────────┐
                │  Answer + Graph + Map +      │
                │  Source Citations + Confidence│
                └──────────────┬──────────────┘
                              ▼
                ┌───────────────────────────┐
                │  Session Memory / Feedback   │
                │  Loop (context for follow-up │
                │  queries, user corrections)  │
                └──────────────┬──────────────┘
                              │
                              ▼
                    (back to Intent Router
                     for next query in session)
```

---

## 2. Component-Level Tech Stack

### 2.1 Frontend
| Component | Technology | Notes |
|---|---|---|
| Framework | React (Vite) | SPA, fast dev cycle |
| Styling | Tailwind CSS | Utility-first, fast to theme |
| Charts | Plotly.js | Depth profiles, time series |
| Maps | Leaflet.js | Float locations, trajectory overlays |
| State management | React Context / Zustand | Session + query state |
| HTTP client | Axios / fetch | API calls to FastAPI backend |

### 2.2 Backend
| Component | Technology | Notes |
|---|---|---|
| API framework | FastAPI (Python) | Async, auto-docs via OpenAPI |
| Server | Uvicorn/Gunicorn | ASGI server |
| Auth (if needed) | JWT / session-based | Scope-dependent, optional for hackathon |
| Task orchestration | Native async endpoints | No need for Celery at this scale |

### 2.3 Intent Router / Query Understanding
| Component | Technology | Notes |
|---|---|---|
| NER | spaCy (`en_core_web_sm` or custom-trained) | Extracts region, parameter, date entities |
| Intent classification | scikit-learn (TF-IDF + SVM or Logistic Regression) | Trained on labeled query type dataset |
| Semantic template matching | sentence-transformers (`all-MiniLM-L6-v2`) | Cosine similarity against predefined query templates |
| Confidence thresholding | Custom logic | Routes to LLM fallback if below threshold |

### 2.4 NL-to-SQL Engine
| Component | Technology | Notes |
|---|---|---|
| Slot-filling | Rule-based + regex + NER output | Maps extracted entities to query parameters |
| SQL construction | Parameterized query templates (Python string templating / SQLAlchemy Core) | No LLM dependency; prevents SQL injection via parameter binding |

### 2.5 Semantic Metadata Retrieval
| Component | Technology | Notes |
|---|---|---|
| Vector DB | ChromaDB | Scoped to fuzzy matching only (ambiguous location/terms) |
| Embedding model | sentence-transformers (`all-MiniLM-L6-v2`) | Lightweight, local, no API dependency |

### 2.6 Forecasting Engine
| Component | Technology | Notes |
|---|---|---|
| Model | LSTM (PyTorch or TensorFlow/Keras) | Trajectory and/or parameter forecasting |
| Training data | Historical ARGO profiles (regional subset) | Scoped for feasibility |
| Evaluation | RMSE, MAE vs. naive baseline | Reported honestly in results |

### 2.7 Database Layer
| Component | Technology | Notes |
|---|---|---|
| Primary DB | PostgreSQL | Structured ARGO data storage |
| Geospatial extension | PostGIS | Region-based spatial queries |
| ORM | SQLAlchemy | Query building, migrations |
| Migrations | Alembic | Schema version control |

### 2.8 Data Ingestion Pipeline
| Component | Technology | Notes |
|---|---|---|
| ARGO data access | `argopy` | Fetches float profiles from GDAC |
| NetCDF processing | `xarray` | Multi-dimensional data handling |
| Data wrangling | `pandas` | Cleaning, transformation before DB load |
| Scheduling (optional) | `cron` / APScheduler | Periodic batch ingestion |

### 2.9 Confidence & Traceability Layer
| Component | Technology | Notes |
|---|---|---|
| Confidence scoring | Custom logic (profile count, QC flag ratio, data recency) | Attached to every response |
| Source citation | WMO IDs, timestamps, coordinates, QC flags | Pulled directly from query results |

### 2.10 Response Generation
| Component | Technology | Notes |
|---|---|---|
| Default path | Template-based NLG (Python f-string/Jinja2 templates) | Zero-hallucination for numeric claims |
| Fallback path | Gemini API (or equivalent LLM API) | Only triggered on low-confidence classification/extraction |

### 2.11 Session & Feedback
| Component | Technology | Notes |
|---|---|---|
| Session storage | Redis (or in-memory dict for hackathon scope) | Tracks conversational context per user session |
| Feedback logging | PostgreSQL table | Stores corrections for future retraining |

---

## 3. Infrastructure & DevOps

| Component | Technology | Notes |
|---|---|---|
| Containerization | Docker + Docker Compose | Reproducible local dev/demo environment |
| Version control | Git / GitHub | Standard workflow |
| Environment config | `.env` files (python-dotenv) | API keys, DB credentials — never hardcoded |
| Deployment (optional) | Render / Railway / local demo | Scope-dependent on hackathon requirements |

---

## 4. Data Flow Summary

1. **Ingestion:** `argopy` fetches ARGO NetCDF data → `xarray`/`pandas` clean and structure it → loaded into PostgreSQL/PostGIS.
2. **Query intake:** User submits a natural language query via React frontend → FastAPI receives it.
3. **Routing:** Intent Router classifies the query and extracts entities using spaCy/scikit-learn/sentence-transformers. If confidence is high, proceeds locally; if low, falls back to Gemini API for interpretation.
4. **Retrieval:** NL-to-SQL generator builds a parameterized SQL query (with ChromaDB assisting only for fuzzy term/location resolution) → executed against PostgreSQL.
5. **Forecasting (if applicable):** LSTM engine generates predictions for forecast-type queries.
6. **Confidence layer:** Attaches WMO IDs, QC flags, profile counts, and a confidence score to the result set.
7. **Output generation:** Template NLG composes the natural language answer (LLM fallback only if needed); Plotly/Leaflet render visualizations.
8. **Delivery:** Answer + graph + map + source citations returned to frontend.
9. **Session update:** Context stored for follow-up queries; user corrections logged for future improvement.

---

## 5. Key Architectural Principles

1. **Retrieval-first, generation-optional** — SQL/template path is the default; LLM is a fallback, not a dependency.
2. **Structured data deserves structured retrieval** — NL-to-SQL over PostgreSQL, not vector search, for numeric ARGO data.
3. **Traceability by default** — every answer carries its data provenance (WMO ID, QC flag, confidence).
4. **Graceful degradation** — ambiguous or sparse-data queries are flagged, not fabricated.
5. **Forecasting is delivered, not deferred** — LSTM module is a working component, not a "future work" bullet.

---

## 6. Comparison Reference (for report use)

| Layer | Reference Systems (FloatChat / SeaSense) | OceanIQ |
|---|---|---|
| Query understanding | LLM-dependent | Classical ML/NER, LLM fallback only |
| Primary retrieval | Vector search (FAISS) / vague semantic DB | NL-to-SQL over PostgreSQL/PostGIS |
| Response generation | LLM-generated text | Template NLG, zero-hallucination by default |
| Forecasting | Proposed as future work | Implemented (LSTM) |
| Cost/dependency | API key or GPU required | Runs without API key/GPU by default |
| Explainability | Attention heatmaps / source citations (separately) | Unified confidence + traceability layer |
