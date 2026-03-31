"""
Alembic migration environment.

Key design decisions:
  - Uses the async engine (asyncpg) directly — no separate sync driver needed.
  - DATABASE_URL comes from .env via app.config.settings — never hardcoded here.
  - include_schemas=True so Alembic tracks all four schemas (staging, warehouse, validation, lineage).
  - version_table_schema="public" stores Alembic's own version tracking in the public schema.
"""
import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from alembic import context

# Make app/ importable from alembic/env.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from app.config import settings       # noqa: E402
from app.db.session import Base       # noqa: E402

# Import every model so Base.metadata knows about all tables across all schemas.
# Without these imports Alembic's autogenerate would see an empty database.
import app.models.staging             # noqa: E402, F401
import app.models.warehouse           # noqa: E402, F401
import app.models.lineage             # noqa: E402, F401  (before validation — FK dependency)
import app.models.validation          # noqa: E402, F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Generate a SQL script without connecting to the database."""
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema="public",
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Connect to PostgreSQL using asyncpg and run the migrations."""
    engine = create_async_engine(settings.database_url, poolclass=NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
