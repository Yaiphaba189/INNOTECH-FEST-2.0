import os
import sys
import glob
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from app.main import app
import app.db.session as session_mod
from app.db.base import Base

TEST_DB_PATH = os.path.join(BACKEND_DIR, "test_isolated.db")
TEST_DB_URL = f"sqlite+aiosqlite:///{TEST_DB_PATH}"


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    # Save original app engine and sessionmaker
    orig_engine = session_mod.engine
    orig_sessionmaker = session_mod._sessionmaker

    # Create isolated test engine
    test_engine = create_async_engine(TEST_DB_URL, echo=False, future=True)
    test_sessionmaker = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )

    # Point session module to isolated test database
    session_mod.engine = test_engine
    session_mod._sessionmaker = test_sessionmaker

    # Create tables in isolated test database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed isolated test data
    from scripts.seed_demo_data import seed_all
    await seed_all()

    yield

    # Teardown: dispose test engine and clean up test files
    await test_engine.dispose()
    session_mod.engine = orig_engine
    session_mod._sessionmaker = orig_sessionmaker

    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

    # Clean any temporary test image uploads created during testing
    sample_dir = os.path.join(REPO_ROOT, "data", "demo", "sample_images")
    if os.path.exists(sample_dir):
        for f in glob.glob(os.path.join(sample_dir, "*")):
            if not f.endswith(".gitkeep"):
                try:
                    os.remove(f)
                except Exception:
                    pass


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture
async def farmer_token(client: AsyncClient):
    res = await client.post("/api/auth/login", json={
        "phone_number": "+919862000001",
        "password": "innotech2026"
    })
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def buyer_token(client: AsyncClient):
    res = await client.post("/api/auth/login", json={
        "phone_number": "+919862000004",
        "password": "innotech2026"
    })
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def fpo_token(client: AsyncClient):
    res = await client.post("/api/auth/login", json={
        "phone_number": "+919862000006",
        "password": "innotech2026"
    })
    return res.json()["access_token"]
