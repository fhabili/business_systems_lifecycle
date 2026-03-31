"""
run_transform.py — populate the warehouse layer from staging data.

Usage:
  cd backend
  uv run python run_transform.py

What it does:
  ECB SUP (171 staging rows) → 3 warehouse tables:
    supervisory_series : 171 rows (one per metric × quarter)
    bank_lcr           : ~36 rows (one per quarter, EU aggregate)
    bank_nsfr          : ~36 rows (one per quarter, EU aggregate)
"""
import asyncio, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.services.transform import run_all_transforms

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def main():
    print("\n=== run_transform.py  —  Staging → Warehouse ===\n")
    t0 = time.monotonic()
    async with AsyncSessionLocal() as db:
        counts = await run_all_transforms(db)
    elapsed = time.monotonic() - t0

    print(f"  supervisory_series : {counts['supervisory_series']:>6,} rows")
    print(f"  bank_lcr           : {counts['bank_lcr']:>6,} rows")
    print(f"  bank_nsfr          : {counts['bank_nsfr']:>6,} rows")
    print(f"\n  Done in {elapsed:.1f}s\n")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
