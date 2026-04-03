from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.lineage import PipelineRun
from app.models.warehouse import BankLcr, BankNsfr, SupervisorySeries
from app.schemas.summary import LcrTrendPoint, NsfrTrendPoint, SummaryResponse

router = APIRouter()


@router.get("/summary", response_model=SummaryResponse)
async def get_summary(db: AsyncSession = Depends(get_db)):
    """
    Executive Summary KPIs — uses the most recent quarter's aggregate data.
    """
    # Most recent reference date in warehouse
    date_res = await db.execute(select(func.max(BankLcr.reference_date)))
    as_of_date = date_res.scalar()

    # Latest LCR and NSFR at that date only
    avg_lcr = avg_nsfr = None
    if as_of_date:
        lcr_res = await db.execute(
            select(func.avg(BankLcr.lcr_ratio)).where(BankLcr.reference_date == as_of_date)
        )
        avg_lcr = lcr_res.scalar()

        nsfr_date_res = await db.execute(select(func.max(BankNsfr.reference_date)))
        nsfr_date = nsfr_date_res.scalar()
        if nsfr_date:
            nsfr_res = await db.execute(
                select(func.avg(BankNsfr.nsfr_ratio)).where(BankNsfr.reference_date == nsfr_date)
            )
            avg_nsfr = nsfr_res.scalar()

    # LCR trend: average LCR by period from supervisory_series (metric_name = "LCR")
    trend_res = await db.execute(
        select(SupervisorySeries.ref_period, func.avg(SupervisorySeries.obs_value))
        .where(SupervisorySeries.metric_name == "LCR")
        .group_by(SupervisorySeries.ref_period)
        .order_by(SupervisorySeries.ref_period)
    )
    lcr_trend = [
        LcrTrendPoint(period=row[0], lcr_ratio=round(row[1], 1))
        for row in trend_res
        if row[0] and row[1] is not None
    ]

    # NSFR trend: average NSFR by period from supervisory_series (metric_name = "NSFR")
    nsfr_trend_res = await db.execute(
        select(SupervisorySeries.ref_period, func.avg(SupervisorySeries.obs_value))
        .where(SupervisorySeries.metric_name == "NSFR")
        .group_by(SupervisorySeries.ref_period)
        .order_by(SupervisorySeries.ref_period)
    )
    nsfr_trend = [
        NsfrTrendPoint(period=row[0], nsfr_ratio=round(row[1], 1))
        for row in nsfr_trend_res
        if row[0] and row[1] is not None
    ]

    # Latest pipeline run
    run_res = await db.execute(
        select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(1)
    )
    latest_run = run_res.scalar_one_or_none()

    # Active alerts: LCR breach (below 100%)
    breach_res = await db.execute(
        select(BankLcr.bank_name, BankLcr.lcr_ratio)
        .where(BankLcr.lcr_ratio < 100)
        .order_by(BankLcr.lcr_ratio)
        .limit(5)
    )
    alerts = [
        f"LCR breach: {row[0] or 'Unknown'} — {round(row[1], 1)}% (min 100%)"
        for row in breach_res
    ]

    return SummaryResponse(
        lcr_ratio=round(avg_lcr, 1) if avg_lcr is not None else None,
        nsfr_ratio=round(avg_nsfr, 1) if avg_nsfr is not None else None,
        # Validation pipeline (run_all_rules) is not yet executed against the warehouse.
        # Return None so the frontend falls back to its statically-computed GLOBAL_QUALITY_SCORE.
        data_quality_score=None,
        as_of_date=str(as_of_date) if as_of_date else None,
        last_pipeline_run=latest_run.started_at if latest_run else None,
        lcr_trend=lcr_trend,
        nsfr_trend=nsfr_trend,
        active_alerts=alerts,
    )

