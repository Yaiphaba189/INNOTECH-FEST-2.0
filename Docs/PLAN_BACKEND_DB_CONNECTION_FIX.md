# Plan — Fix backend DB connection (PostgreSQL needlessly falling back to SQLite)

## Goal

Make `uv run uvicorn app.main:app --reload` connect to the local PostgreSQL database
(which is already provisioned and healthy) instead of silently downgrading to SQLite, and
confirm the API is reachable.

## Findings (evidence-based)

1. **`/health` → 404 is not a bug.** The health route is `GET /api/health`
   (`backend/app/main.py:65`). Verified against the running server:
   `GET /` → 200, `GET /api/health` → 200, `GET /docs` → 200. The backend is already up.

2. **Root cause of the SQLite fallback: a failed statement aborts the transaction.**
   `backend/app/db/session.py:56-64`:

   ```python
   async with engine.begin() as conn:
       if "postgresql" in str(engine.url):
           try:
               await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
           except Exception as ex:
               logger.warning(f"PostGIS extension notice: {ex}")
       await conn.run_sync(Base.metadata.create_all)
   ```

   PostGIS is not installed in the local PostgreSQL server
   (`pg_available_extensions` has no `postgis` row — confirmed). The `CREATE EXTENSION`
   fails, and in PostgreSQL a failed statement **aborts the entire transaction**, which is
   exactly the second error in the log: `current transaction is aborted, commands ignored
   until end of transaction block`. The `except` logs and continues, but the transaction is
   already dead, so `create_all` fails as well — and the outer handler switches to SQLite.

   PostgreSQL itself is fine: all 9 tables plus `alembic_version` exist.

3. **The fallback is unconditional and silent.** `settings.USE_SQLITE_FALLBACK` is declared
   (`config.py:29`) but never referenced anywhere. Runtime writes silently land in
   `backend/harvestlink.db` instead of PostgreSQL.

4. **The import-time guard is dead code.** `session.py:12-17` wraps `create_async_engine` in
   `try/except`, but that call never opens a connection, so it can never raise.

5. **Both databases are empty** — tables exist, zero rows in `users`, `farms`,
   `crop_records`, `harvest_lots`, `buyer_orders`.

6. `Invalid HTTP request received` is uvicorn receiving non-HTTP (usually TLS) bytes on a
   plain-HTTP port. Benign, but worth identifying if it recurs.

## Changes (all in `backend/app/db/session.py`)

### 1. Stop the PostGIS probe from killing the transaction

Isolate the extension attempt in a savepoint so its failure rolls back only itself:

```python
if engine.dialect.name == "postgresql":
    try:
        async with conn.begin_nested():
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    except Exception as ex:
        logger.info("PostGIS unavailable; continuing without it: %s", ex)
```

`create_all` then runs on a still-healthy transaction.

### 2. Make the fallback explicit and visible

- Honour `settings.USE_SQLITE_FALLBACK` and re-raise when it is `False` (no silent downgrade).
- Log at WARNING with the failing URL (password hidden) and the fallback path.
- Log which database was selected on success.

### 3. Remove the dead import-time `try/except`

It cannot fire and misleads future readers.

**Not changing:** the alembic migration, the models, or `spatial.py` (it uses plain
lat/lng + haversine, so PostGIS is genuinely unnecessary for correctness).

## Verification

1. Restart the backend; read startup logs — expect `Database schemas initialized
   successfully` with the PostgreSQL URL and **no** "PostGIS extension notice" /
   "Switching to fallback SQLite".
2. Confirm the active engine is PostgreSQL, not `harvestlink.db`.
3. `GET /api/health` → 200, `GET /api/farms` → 200 (empty list).
4. Run the backend test suite (`uv run pytest`) and report the real output.
5. Confirm the safety net still works: temporarily point `DATABASE_URL` at a dead host and
   check that the SQLite fallback engages as intended.

## Open questions

- Is the goal **(a)** the backend connecting to PostgreSQL, or **(b)** wiring the frontend
  to this backend? `.env` already sets `NEXT_PUBLIC_API_URL=http://localhost:8000`, and the
  API surface maps cleanly onto frontend Modules A–D.
- Should demo data be seeded into PostgreSQL afterwards
  (`backend/scripts/seed_demo_data.py`)?
