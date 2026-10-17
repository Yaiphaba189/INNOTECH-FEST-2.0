import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
engine_args = {"echo": False, "future": True}

# create_async_engine never opens a connection, so it cannot fail here. The real
# fallback decision is made in init_db(), where a connection is actually established.
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
            if engine.dialect.name == "postgresql":
                # PostgreSQL aborts the entire transaction when any statement fails, so the
                # extension probe gets its own savepoint. Without it, an unavailable PostGIS
                # poisons the transaction, the create_all below fails, and the error cascades
                # into a bogus SQLite fallback even though PostgreSQL is perfectly healthy.
                # No model uses geometry columns (spatial.py uses lat/lng + haversine),
                # so PostGIS stays strictly best-effort.
                try:
                    async with conn.begin_nested():
                        await conn.execute(
                            text("CREATE EXTENSION IF NOT EXISTS postgis;")
                        )
                except Exception as ex:
                    logger.info("PostGIS unavailable; continuing without it: %s", ex)
            await conn.run_sync(Base.metadata.create_all)
        logger.info(
            "Database schemas initialized on %s",
            engine.url.render_as_string(hide_password=True),
        )
    except Exception as e:
        if not settings.USE_SQLITE_FALLBACK:
            logger.error(
                "Primary database unavailable and SQLite fallback is disabled: %s", e
            )
            raise
        logger.warning(
            "Primary database unavailable (%s). Falling back to SQLite at %s.",
            e,
            settings.FALLBACK_SQLITE_URL,
        )
        engine = create_async_engine(settings.FALLBACK_SQLITE_URL, **engine_args)
        _sessionmaker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.warning(
            "Fallback SQLite database initialized at %s", settings.FALLBACK_SQLITE_URL
        )
