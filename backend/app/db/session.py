import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
engine_args = {"echo": False, "future": True}

try:
    engine = create_async_engine(db_url, **engine_args)
except Exception as e:
    logger.warning(f"Could not initialize primary database engine {db_url}: {e}")
    db_url = settings.FALLBACK_SQLITE_URL
    engine = create_async_engine(db_url, **engine_args)

_sessionmaker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_session() -> AsyncSession:
    """Returns a new AsyncSession from the currently active engine."""
    return _sessionmaker()


def AsyncSessionLocal() -> AsyncSession:
    """Callable factory ensuring active sessionmaker is always used."""
    return _sessionmaker()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initializes tables for development/testing if they do not exist."""
    global engine, _sessionmaker
    from app.db.base import Base
    import app.models  # noqa: F401

    try:
        async with engine.begin() as conn:
            if "postgresql" in str(engine.url):
                try:
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                except Exception as ex:
                    logger.warning(f"PostGIS extension notice: {ex}")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schemas initialized successfully.")
    except Exception as e:
        logger.warning(f"Connecting to primary database failed: {e}. Switching to fallback SQLite.")
        fallback_engine = create_async_engine(settings.FALLBACK_SQLITE_URL, **engine_args)
        engine = fallback_engine
        _sessionmaker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Fallback SQLite database initialized successfully.")
