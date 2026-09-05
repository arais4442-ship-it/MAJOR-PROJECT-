# Project Memory & Architecture Context

This document serves as the persistent memory for project context, system architecture, core rules, design decisions, and active work logs.

---

## 📌 Project Overview
- **Project Name**: OceanIQ — Hybrid Retrieval-First ARGO Ocean Data Assistant
- **Status**: Core Architecture & Full System Implementation Completed
- **Core Technology Stack**: Next.js 14 (App Router) + Tailwind CSS + Plotly.js + Leaflet.js | FastAPI + PostgreSQL/PostGIS + SQLAlchemy + spaCy + scikit-learn + PyTorch OceanLSTM
- **Primary Goal**: Deliver zero-hallucination natural language querying, interactive visualizations, and PyTorch LSTM forecasting for ARGO ocean float data.

---

## 🧠 System Context & Design Decisions
- **[2026-08-14] Architecture Plan Approved**: Implementation plan created and approved by user, with Next.js App Router selected for frontend framework.
- **[2026-08-14] Retrieval-First SQL Engine**: Built zero-hallucination default query path via SQLAlchemy + PostGIS + spaCy NER + scikit-learn intent classifier + template NLG.
- **[2026-08-14] LSTM Forecasting**: Built PyTorch `OceanLSTM` neural network module for trajectory and parameter forecasting.
- **[2026-08-14] Next.js Dashboard**: Built Next.js 14 App Router UI with dynamic Plotly depth profiles, Leaflet interactive maps, Chat console, and Source Citations panel.
- **[2026-08-19] SQLite Engine Migration**: Fallback database engine shifted from PostgreSQL/PostGIS to SQLite (`sqlite+aiosqlite`) to run the ecosystem seamlessly on environments lacking local Docker registries. Seeding script fixed to resolve critical primary key check logic bug.

---

## 🎯 Active Tasks & Roadmap
- [x] Set up base project tracking files (`Commands.md`, `memory.md`, `code_change.md`).
- [x] Create approved implementation plan for `PRD.md` and `TECH_STACK.md`.
- [x] Create Docker PostGIS setup (`docker-compose.yml`).
- [x] Build FastAPI backend data models, DB session, and ingestion pipeline (`ingest_argo.py`).
- [x] Build Intent Router, NER extractor, and NL-to-SQL engine.
- [x] Build PyTorch `OceanLSTM` forecasting engine.
- [x] Build Next.js 14 App Router frontend dashboard with Plotly charts and Leaflet maps.

---

## 🔒 Rules & Conventions
- Maintain up-to-date entries in `code_change.md` whenever code modifications are made.
- Document new commands and tools in `Commands.md`.
- Keep high-level technical decisions and context updated in `memory.md`.

