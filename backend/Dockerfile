FROM python:3.11-slim

# Copy official uv binary for high-speed package management
COPY --from=ghcr.io/astral-sh/uv:0.9.11 /uv /bin/uv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend:/app

WORKDIR /app

# Install system dependencies for build, image processing, and PostGIS client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies using uv for 10x faster builds
COPY backend/requirements.txt /app/backend/requirements.txt
RUN uv pip install --system --no-cache -r /app/backend/requirements.txt

# Copy backend application, intelligence layer, and demo data
COPY backend /app/backend
COPY intelligence_layer /app/intelligence_layer
COPY data /app/data

WORKDIR /app/backend

# Create upload directory
RUN mkdir -p /app/data/demo/sample_images

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run FastAPI via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
