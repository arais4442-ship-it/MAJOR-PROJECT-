# Product Requirements Document (PRD)

## Project Name
**OceanIQ** — A Hybrid Retrieval-First Conversational Interface for ARGO Ocean Data Discovery, Visualization, and Forecasting

*(Working name — align with your final paper/SIH title before submission)*

---

## 1. Overview

### 1.1 Problem Statement
ARGO ocean float data (temperature, salinity, pressure, biogeochemical parameters) is stored in NetCDF format and accessed through specialist tools like ERDDAP or ODV. This creates a significant barrier for policymakers, students, educators, and non-technical researchers who need ocean insights but lack programming or domain expertise to extract them.

Existing conversational AI solutions in this space (e.g., FloatChat, SeaSense) rely heavily on generative LLMs or vector-based RAG for numeric data retrieval — introducing hallucination risk, API/GPU dependency costs, and unproven forecasting capability (left as "future work" in prior systems).

### 1.2 Solution Summary
OceanIQ is a conversational system that answers natural language queries about ARGO ocean data using a **retrieval-first, structured-query-primary architecture**. It defaults to classical ML (NER, intent classification) and NL-to-SQL generation against a PostgreSQL/PostGIS backend, uses template-based natural language generation for zero-hallucination responses, and falls back to an LLM only for low-confidence or ambiguous queries. It also ships a working LSTM-based forecasting module — a capability competitors only propose but don't deliver.

### 1.3 Target Users
- Marine researchers and oceanography students
- Policymakers and government bodies (Ministry of Earth Sciences, INCOIS)
- Educators and non-specialist decision-makers
- Data analysts needing quick exploratory access without scripting

---

## 2. Goals and Objectives

### 2.1 Primary Goals
1. Enable natural language querying of ARGO ocean data without requiring programming knowledge.
2. Minimize hallucination and unverifiable claims in system responses.
3. Reduce dependency on paid APIs/GPU-heavy local LLMs for core functionality.
4. Deliver a working forecasting capability (not just propose one).
5. Provide traceable, source-cited answers (WMO float IDs, timestamps, QC flags).

### 2.2 Success Metrics
| Metric | Target |
|---|---|
| Query intent classification accuracy | ≥ 90% |
| NL-to-SQL query correctness (verified against ground truth) | ≥ 85% |
| Average response latency (template path) | < 3 seconds |
| Average response latency (LLM fallback path) | < 8 seconds |
| Hallucination rate on numeric claims (template path) | ~0% (structurally enforced) |
| Forecasting RMSE (LSTM module, parameter-dependent) | Benchmarked against naive baseline, report % improvement |
| User satisfaction (usability study, n≥15) | ≥ 80% task completion without confusion |

### 2.3 Non-Goals (Explicitly Out of Scope for V1)
- Voice input/output
- Real-time streaming ingestion from GDAC (batch ingestion only for V1)
- Multi-language support beyond English
- Mobile-native app (responsive web only)
- Full generalization to all ocean datasets beyond ARGO (BGC data included, satellite data optional/stretch)

---

## 3. User Stories

### 3.1 Core Query Flows
- **As a researcher**, I want to ask "Show me temperature trends in the Arabian Sea during monsoon 2023" and get a chart + map + summarized answer with source floats cited.
- **As a policymaker**, I want to ask a simple comparative question ("How does salinity in Region A compare to Region B?") and get a clear, non-technical answer.
- **As a student**, I want to ask follow-up questions in the same session ("Now show me the same for winter") without repeating full context.
- **As an analyst**, I want to ask "Predict temperature trends for this region over the next month" and get a forecast with a confidence indicator.
- **As any user**, I want to know how reliable an answer is — I want to see the data source, number of profiles used, and quality flags.

### 3.2 Edge Cases
- Query is ambiguous or ill-formed → system should fall back to LLM-assisted interpretation, or ask a clarifying question.
- No data available for requested region/time → system should state this clearly rather than fabricating results.
- Low data density (sparse profiles) → confidence score should reflect this.

---

## 4. Functional Requirements

### 4.1 Query Understanding
- FR1: System must classify incoming queries into types (trend, comparison, point lookup, forecast, unknown).
- FR2: System must extract entities: geographic region, parameter (temperature/salinity/pressure/BGC), time range, depth range.
- FR3: System must route queries to the correct engine (NL-to-SQL, semantic metadata retrieval, or forecasting) based on classification.
- FR4: System must fall back to LLM-based interpretation when classification/extraction confidence falls below a defined threshold.

### 4.2 Data Retrieval
- FR5: System must construct valid SQL queries from extracted slots without requiring an LLM for the default path.
- FR6: System must support fuzzy matching for ambiguous location names or terminology via vector similarity search.
- FR7: System must query PostgreSQL/PostGIS for geospatial and parameter-based filtering.

### 4.3 Forecasting
- FR8: System must support LSTM-based forecasting for at least one ocean parameter (temperature and/or salinity) and float trajectory.
- FR9: Forecast responses must include a confidence/error indicator.

### 4.4 Response Generation
- FR10: System must generate responses via template-based NLG by default.
- FR11: System must fall back to an LLM (API-based) only when template coverage or confidence is insufficient.
- FR12: All responses must include source citations: WMO float ID(s), timestamps, geographic coordinates, QC flags, profile count.

### 4.5 Visualization
- FR13: System must render depth profiles, time-series trends, and geospatial maps using Plotly and Leaflet.
- FR14: Visualizations must update dynamically based on query parameters (region, time, depth).

### 4.6 Session and Feedback
- FR15: System must maintain session context to support follow-up queries.
- FR16: System must allow users to flag/correct misinterpreted queries, logged for future improvement.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Template-path responses under 3s; forecasting responses under 5s |
| Reliability | System must degrade gracefully (clarifying question) rather than fabricate answers on missing/ambiguous data |
| Scalability | Must handle ARGO dataset subsets of 10,000+ profiles without significant latency degradation |
| Cost | Core functionality must not require a paid API key or GPU; LLM fallback is optional and budget-capped |
| Explainability | Every numeric claim must be traceable to source float(s) and QC status |
| Accessibility | UI usable by non-technical users; avoid requiring query syntax knowledge |
| Data Integrity | No modification of source ARGO data; all transformations logged |

---

## 6. Assumptions and Constraints
- ARGO data will be ingested via `argopy`/`xarray` in batch mode for the demo/hackathon scope; real-time GDAC sync is future work.
- LLM fallback (Gemini API or equivalent) requires an API key and internet access — must be clearly optional/toggleable, not a hard dependency.
- Forecasting model (LSTM) will be trained on a regional subset (e.g., Indian Ocean) for feasibility within project timeline.
- Team has access to PostgreSQL with PostGIS extension enabled.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Classical NLP (spaCy/NER) fails on complex/creative query phrasing | LLM fallback path with confidence threshold |
| LSTM forecasting accuracy is weak with limited training data | Scope forecasting to a well-observed region; report honest error metrics, not inflated claims |
| PostgreSQL/PostGIS setup complexity under hackathon time pressure | Use Docker Compose for reproducible local setup early |
| Judges perceive "no-LLM-by-default" as lower capability vs. competitors | Frame explicitly in report/demo as a deliberate reliability/cost trade-off, backed by hallucination-rate metrics |
| Sparse ARGO data in some regions/time windows | Confidence layer explicitly surfaces data sparsity instead of hiding it |

---

## 8. Milestones (Suggested)

| Phase | Deliverable |
|---|---|
| Phase 1 | Data ingestion pipeline (argopy → PostgreSQL/PostGIS) working end-to-end |
| Phase 2 | Intent Router + NL-to-SQL for core query types (trend, point lookup) |
| Phase 3 | Visualization engine (Plotly + Leaflet) wired to query results |
| Phase 4 | Confidence/traceability layer + template NLG |
| Phase 5 | LSTM forecasting module (single parameter, single region) |
| Phase 6 | LLM fallback integration + session memory |
| Phase 7 | Evaluation (accuracy, latency, hallucination rate) + user study |
| Phase 8 | Report/paper write-up + demo polish |

---

## 9. Open Questions
- Which region(s) will be the primary demo focus (Indian Ocean assumed, confirm scope)?
- Will BGC (biogeochemical) parameters be included in V1 or deferred?
- What is the acceptable LLM fallback budget (API cost cap) for the demo period?
