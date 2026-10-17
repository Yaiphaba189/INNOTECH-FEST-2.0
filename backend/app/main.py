import os
import sys

# Ensure repository root is in Python module search path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.errors import AppError, app_error_handler, http_exception_handler
from app.db.session import init_db
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload directory exists and database schemas are initialized
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title="HARVESTLINK AI API",
    description=(
        "Predictive Crop Intelligence and Smart Market Linkage for Manipur horticulture "
        "(INNOTECH FEST 2.0 Hackathon Prototype)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom error handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# Mount local upload directory for static photo access if exists
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/data/demo/sample_images", StaticFiles(directory=settings.UPLOAD_DIR), name="sample_images")

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/api/health", tags=["Health & Status"])
async def health_check():
    return {
        "status": "healthy",
        "service": "HARVESTLINK AI Backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "HARVESTLINK AI API",
        "description": "Predictive Crop Intelligence and Smart Market Linkage for Manipur",
        "documentation": "/docs",
        "openapi": "/openapi.json",
        "status": "operational"
    }
