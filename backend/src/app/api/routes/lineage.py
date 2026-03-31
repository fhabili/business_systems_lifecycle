from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.lineage import LayerEvent, PipelineRun
from app.schemas.lineage import LayerEventRow, LineageResponse, PipelineRunRow

router = APIRouter()


@router.get("/lineage", response_model=LineageResponse)
async def get_lineage(db: AsyncSession = Depends(get_db)):
    """
    Data Lineage — full audit trail of every pipeline run.
    For each run, shows how many rows passed through each layer (staging → warehouse → validation).
    This is what a BSA/IT auditor looks at to verify data integrity.
    """
    runs_res = await db.execute(
        select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(20)
    )
    runs = runs_res.scalars().all()

    run_rows: list[PipelineRunRow] = []
    for run in runs:
        events_res = await db.execute(
            select(LayerEvent)
            .where(LayerEvent.run_id == run.id)
            .order_by(LayerEvent.started_at)
        )
        events = events_res.scalars().all()

        run_rows.append(PipelineRunRow(
            id=run.id,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=run.status,
            trigger=run.trigger,
            events=[LayerEventRow.model_validate(e) for e in events],
        ))

    return LineageResponse(
        runs=run_rows,
        latest_run_id=runs[0].id if runs else None,
    )
