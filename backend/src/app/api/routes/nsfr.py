from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.models.warehouse import BankNsfr
from app.schemas.nsfr import BankNsfrRow, NsfrResponse

router = APIRouter()


@router.get("/nsfr", response_model=NsfrResponse)
async def get_nsfr(
    country: Optional[str] = Query(None, description="Filter by 2-letter country code, e.g. DE"),
    db: AsyncSession = Depends(get_db),
):
    """
    NSFR Detail — per-bank Net Stable Funding Ratio positions.
    Returns Available Stable Funding, Required Stable Funding, and the resulting ratio.
    """
    query = select(BankNsfr).order_by(BankNsfr.reference_date.desc(), BankNsfr.nsfr_ratio)
    if country:
        query = query.where(BankNsfr.country == country.upper())

    result = await db.execute(query)
    banks = result.scalars().all()

    ratios = [b.nsfr_ratio for b in banks if b.nsfr_ratio is not None]

    return NsfrResponse(
        banks=[BankNsfrRow.model_validate(b) for b in banks],
        avg_nsfr=round(sum(ratios) / len(ratios), 1) if ratios else None,
        min_nsfr=round(min(ratios), 1) if ratios else None,
        max_nsfr=round(max(ratios), 1) if ratios else None,
    )
