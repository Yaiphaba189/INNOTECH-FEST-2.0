import os
import sys
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ensure repo root is available
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "harvestlink_secret_key_innotech_fest_2026_super_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    POSTGRES_USER: str = "harvestlink_user"
    POSTGRES_PASSWORD: str = "harvestlink_password"
    POSTGRES_DB: str = "harvestlink_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://harvestlink_user:harvestlink_password@localhost:5432/harvestlink_db"
    # Fallback SQLite DB for local development/test if PostgreSQL container is offline
    FALLBACK_SQLITE_URL: str = "sqlite+aiosqlite:///./harvestlink.db"
    USE_SQLITE_FALLBACK: bool = True

    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "HARVESTLINK AI API"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Storage & File Uploads
    UPLOAD_DIR: str = os.path.join(REPO_ROOT, "data", "demo", "sample_images")
    MAX_UPLOAD_SIZE_BYTES: int = 5242880  # 5MB

    # AI / ML
    MODEL_WEIGHTS_PATH: str = os.path.join(REPO_ROOT, "data", "models", "pineapple_mobilenet_v1.pt")
    INFERENCE_DEVICE: str = "cpu"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
