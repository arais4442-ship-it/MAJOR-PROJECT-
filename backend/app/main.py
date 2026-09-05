from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.routes import router
from backend.app.api.auth_routes import auth_router, users_router
from backend.app.db.session import engine, Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        from backend.app.live.sync_scheduler import sync_scheduler
        sync_scheduler.start()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Sync scheduler failed to start: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        from backend.app.live.sync_scheduler import sync_scheduler
        sync_scheduler.stop()
    except Exception:
        pass

app.include_router(router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}")
app.include_router(users_router, prefix=f"{settings.API_V1_STR}")

@app.get("/")
def root():
    return {"message": "OceanIQ API is online", "docs": "/docs", "version": "2.0"}
