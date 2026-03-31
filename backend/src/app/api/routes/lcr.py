from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.models.warehouse import BankLcr
from app.schemas.lcr import BankLcrRow, LcrResponse

router = APIRouter()


@router.get("/lcr", response_model=LcrResponse)
async def get_lcr(
    country: Optional[str] = Query(None, description="Filter by 2-letter country code, e.g. DE"),
    db: AsyncSession = Depends(get_db),
):
    """
    LCR Detail — per-bank Liquidity Coverage Ratio positions.
    Returns every bank's HQLA, net outflow, and LCR ratio.
    Optional country filter for drill-down (e.g. German banks only).
    """
    query = select(BankLcr).order_by(BankLcr.reference_date.desc(), BankLcr.lcr_ratio)
    if country:
        query = query.where(BankLcr.country == country.upper())

    result = await db.execute(query)
    banks = result.scalars().all()

    ratios = [b.lcr_ratio for b in banks if b.lcr_ratio is not None]

    return LcrResponse(
        banks=[BankLcrRow.model_validate(b) for b in banks],
        avg_lcr=round(sum(ratios) / len(ratios), 1) if ratios else None,
        min_lcr=round(min(ratios), 1) if ratios else None,
        max_lcr=round(max(ratios), 1) if ratios else None,
    )
