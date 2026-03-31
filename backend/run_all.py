"""
run_all.py — top-level ingestion orchestrator for all active data sources.

Usage:
  cd backend
  uv run python run_all.py

Sources:
  ecb_sup       — ECB supervisory metrics (6 quarterly CSV files)
  bista         — Bundesbank BISTA balance-sheet data (Stata .dta / .dta.gz)
  bis           — BIS Locational Banking Statistics (3 quarterly CSV files)
  ecb_eurosystem— ECB Eurosystem annual balance sheet (1 CSV file)

The script:
  1. Ensures all new staging tables exist (create_all, not drop_all).
  2. Runs each ingestor in sequence inside its own DB session.
  3. Prints a summary table with row counts and status for each source.
"""
import asyncio
import sys
import time
from pathlib import Path

# ----- path bootstrap -------------------------------------------------------
sys.path.insert(0, str(Path(__file__).parent / "src"))

# ----- imports --------------------------------------------------------------
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import (          # noqa: F401  — needed for Base to see all models
    FileLoad, EcbSupRaw, BistaRaw, BisLbsRaw, EcbEurosystemRaw,
    BankLcr, BankNsfr, SupervisorySeries,
    PipelineRun, LayerEvent,
    RuleDefinition, RuleResult,
    DimEntity, DimPeriod, DimMetric, DimSource,
)
from app.models.staging    import Base as StagingBase
from app.models.warehouse  import Base as WarehouseBase
from app.models.lineage    import Base as LineageBase
from app.models.validation import Base as ValidationBase
from app.models.dimensions import Base as DimBase

from app.ingest import bista, ecb_sup, bis_lbs, ecb_eurosystem
# eba is intentionally excluded — source was a Risk Assessment Questionnaire, not supervisory data

# ----- DB engine -------------------------------------------------------------
engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ----- helpers ---------------------------------------------------------------
async def ensure_tables() -> None:
    """Create all new tables (idempotent — skips existing ones)."""
    async with engine.begin() as conn:
        for base in (StagingBase, WarehouseBase, LineageBase, ValidationBase, DimBase):
            await conn.run_sync(base.metadata.create_all)
    print("  [tables] schema sync complete")


async def run_source(name: str, ingestor_fn, run_id: int | None = None):
    """
    Run a single ingestor inside its own session.
    Returns (name, rows_inserted, elapsed_seconds, error_or_None).
    """
    t0 = time.monotonic()
    try:
        async with AsyncSessionLocal() as db:
            rows = await ingestor_fn(db, run_id=run_id)
        elapsed = time.monotonic() - t0
        return (name, rows, elapsed, None)
    except Exception as exc:
        elapsed = time.monotonic() - t0
        return (name, 0, elapsed, str(exc))


# ----- main ------------------------------------------------------------------
async def main() -> None:
    print("\n=== run_all.py  —  Business Systems Lifecycle ingestion ===\n")

    print("Step 1: ensuring tables exist …")
    await ensure_tables()

    print("\nStep 2: running ingestors …\n")
    sources = [
        ("ecb_sup",        ecb_sup.ingest),
        ("bista",          bista.ingest),
        ("bis",            bis_lbs.ingest),
        ("ecb_eurosystem", ecb_eurosystem.ingest),
    ]

    results = []
    for name, fn in sources:
        print(f"  [{name}] starting …", end=" ", flush=True)
        result = await run_source(name, fn)
        status = "OK" if result[3] is None else "FAILED"
        print(f"{status}  ({result[1]:,} rows in {result[2]:.1f}s)")
        if result[3]:
            print(f"    ERROR: {result[3][:1000]}")
        results.append(result)

    print("\n" + "=" * 60)
    print(f"  {'Source':<20} {'Rows':>10}  {'Time':>8}  {'Status'}")
    print("  " + "-" * 52)
    total_rows = 0
    for name, rows, elapsed, err in results:
        status = "OK" if err is None else "FAILED"
        print(f"  {name:<20} {rows:>10,}  {elapsed:>6.1f}s  {status}")
        total_rows += rows
    print("  " + "-" * 52)
    print(f"  {'TOTAL':<20} {total_rows:>10,}")
    print("=" * 60 + "\n")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
