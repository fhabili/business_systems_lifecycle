"""
Transform service — moves data from the Staging layer to the Warehouse layer.

ECB SUP is our primary source for LCR/NSFR ratios (EU-wide aggregate, quarterly).
It feeds three warehouse tables:
  - supervisory_series  : one row per (metric × quarter)
  - bank_lcr            : pivoted LCR components by quarter
  - bank_nsfr           : pivoted NSFR components by quarter
"""
import re
from datetime import date
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staging import EcbSupRaw
from app.models.warehouse import BankLcr, BankNsfr, SupervisorySeries

# Maps ECB SUP series_key → human metric_name stored in supervisory_series
METRIC_NAME_MAP = {
    "LCR_RATIO":   "LCR",
    "NSFR_RATIO":  "NSFR",
    "LCR_BUFFER":  "LCR_BUFFER",
    "LCR_OUTFLOW": "LCR_OUTFLOW",
    "NSFR_ASF":    "NSFR_ASF",
    "NSFR_RSF":    "NSFR_RSF",
}

_QTR_ENDS = {1: (3, 31), 2: (6, 30), 3: (9, 30), 4: (12, 31)}


def _quarter_to_date(ref_period: str) -> date | None:
    """Convert 'YYYYQN' string to the last calendar day of that quarter."""
    m = re.match(r'^(\d{4})Q([1-4])$', ref_period or "")
    if not m:
        return None
    year, q = int(m.group(1)), int(m.group(2))
    mo, day = _QTR_ENDS[q]
    return date(year, mo, day)


async def transform_ecb_sup(run_id: int | None, db: AsyncSession) -> int:
    """
    Read all rows from staging.ecb_sup_raw and write to warehouse.supervisory_series.
    Clears existing ECB SUP rows first so re-runs are idempotent.
    Returns number of rows written.
    """
    # Clear previous ECB SUP rows
    await db.execute(
        delete(SupervisorySeries).where(SupervisorySeries.ref_area == "EU")
    )
    await db.flush()

    result = await db.execute(select(EcbSupRaw))
    raw_rows = result.scalars().all()

    inserted = 0
    for row in raw_rows:
        metric_name = METRIC_NAME_MAP.get(row.series_key, row.series_key)
        db.add(SupervisorySeries(
            series_key=row.series_key,
            ref_area="EU",
            freq="Q",
            ref_period=row.ref_period,
            period_date=_quarter_to_date(row.ref_period),
            metric_name=metric_name,
            obs_value=row.obs_value,
        ))
        inserted += 1

    await db.flush()
    return inserted


async def transform_ecb_sup_lcr(run_id: int | None, db: AsyncSession) -> int:
    """
    Pivot ECB SUP LCR metrics by quarter into warehouse.bank_lcr.
    One row per quarter: LCR_RATIO + LCR_BUFFER + LCR_OUTFLOW.
    Clears previous ECB aggregate rows before inserting.
    Returns number of rows written.
    """
    await db.execute(
        delete(BankLcr).where(BankLcr.bank_id == "ECB_EU_AGGREGATE")
    )
    await db.flush()

    result = await db.execute(
        select(EcbSupRaw).where(
            EcbSupRaw.series_key.in_(["LCR_RATIO", "LCR_BUFFER", "LCR_OUTFLOW"])
        )
    )
    raw_rows = result.scalars().all()

    # Group by ref_period
    by_period: dict[str, dict[str, float]] = {}
    for row in raw_rows:
        if row.ref_period and row.obs_value is not None:
            by_period.setdefault(row.ref_period, {})[row.series_key] = row.obs_value

    inserted = 0
    for period, data in sorted(by_period.items()):
        db.add(BankLcr(
            bank_id="ECB_EU_AGGREGATE",
            bank_name="EU Banking Sector (ECB Aggregate)",
            country="EU",
            reference_date=_quarter_to_date(period),
            hqla_amount=data.get("LCR_BUFFER"),
            net_outflow=data.get("LCR_OUTFLOW"),
            lcr_ratio=data.get("LCR_RATIO"),
            source="ECB_SUP",
        ))
        inserted += 1

    await db.flush()
    return inserted


async def transform_ecb_sup_nsfr(run_id: int | None, db: AsyncSession) -> int:
    """
    Pivot ECB SUP NSFR metrics by quarter into warehouse.bank_nsfr.
    One row per quarter: NSFR_RATIO + NSFR_ASF + NSFR_RSF.
    Returns number of rows written.
    """
    await db.execute(
        delete(BankNsfr).where(BankNsfr.bank_id == "ECB_EU_AGGREGATE")
    )
    await db.flush()

    result = await db.execute(
        select(EcbSupRaw).where(
            EcbSupRaw.series_key.in_(["NSFR_RATIO", "NSFR_ASF", "NSFR_RSF"])
        )
    )
    raw_rows = result.scalars().all()

    by_period: dict[str, dict[str, float]] = {}
    for row in raw_rows:
        if row.ref_period and row.obs_value is not None:
            by_period.setdefault(row.ref_period, {})[row.series_key] = row.obs_value

    inserted = 0
    for period, data in sorted(by_period.items()):
        db.add(BankNsfr(
            bank_id="ECB_EU_AGGREGATE",
            bank_name="EU Banking Sector (ECB Aggregate)",
            country="EU",
            reference_date=_quarter_to_date(period),
            asf_amount=data.get("NSFR_ASF"),
            rsf_amount=data.get("NSFR_RSF"),
            nsfr_ratio=data.get("NSFR_RATIO"),
            source="ECB_SUP",
        ))
        inserted += 1

    await db.flush()
    return inserted


async def run_all_transforms(db: AsyncSession) -> dict:
    """Run all three ECB SUP transforms in one session. Returns row counts."""
    series_rows = await transform_ecb_sup(None, db)
    lcr_rows    = await transform_ecb_sup_lcr(None, db)
    nsfr_rows   = await transform_ecb_sup_nsfr(None, db)
    await db.commit()
    return {
        "supervisory_series": series_rows,
        "bank_lcr":           lcr_rows,
        "bank_nsfr":          nsfr_rows,
    }
