import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "OceanIQ API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./oceaniq.db"
    SYNC_DATABASE_URL: str = "sqlite:///./oceaniq.db"
    
    GEMINI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3"
    LLM_PROVIDER: str = "ollama"  # "ollama" | "gemini" | "auto"
    CONFIDENCE_THRESHOLD: float = 0.65
    
    DEFAULT_REGION_MIN_LAT: float = 0.0
    DEFAULT_REGION_MAX_LAT: float = 30.0
    DEFAULT_REGION_MIN_LON: float = 50.0
    DEFAULT_REGION_MAX_LON: float = 100.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

