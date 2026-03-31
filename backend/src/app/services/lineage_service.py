"""
Lineage service — creates and updates pipeline_runs and layer_events.

Every step in the pipeline calls these functions to keep the audit trail current.
The Data Lineage tab in the frontend reads exactly these tables.
"""
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lineage import LayerEvent, PipelineRun


async def start_pipeline_run(db: AsyncSession, trigger: str = "manual") -> int:
    """
    Open a new pipeline run. Returns the run_id.
    Call this at the very start of any ingestion job.
    """
    run = PipelineRun(status="running", trigger=trigger)
    db.add(run)
    await db.flush()    # flush to get the auto-generated id without committing
    await db.commit()
    return run.id


async def finish_pipeline_run(run_id: int, status: str, db: AsyncSession) -> None:
    """
    Close a pipeline run: set its finished_at timestamp and final status.
    Call this at the end of the ingestion job, pass 'success' or 'failed'.
    """
    result = await db.execute(select(PipelineRun).where(PipelineRun.id == run_id))
    run = result.scalar_one_or_none()
    if run:
        run.finished_at = datetime.now(timezone.utc)
        run.status = status
        await db.commit()


async def log_layer_event(
    run_id: int,
    layer: str,
    source_name: str,
    rows_in: int,
    rows_out: int,
    status: str,
    db: AsyncSession,
    error_message: str | None = None,
) -> None:
    """
    Write one layer_events row after a layer finishes processing.
    rows_in  = how many rows the layer received
    rows_out = how many rows the layer produced (may differ due to deduplication, filtering, etc.)
    If rows_in != rows_out, the discrepancy is visible in the Data Lineage tab.
    """
    event = LayerEvent(
        run_id=run_id,
        layer=layer,
        source_name=source_name,
        rows_in=rows_in,
        rows_out=rows_out,
        status=status,
        finished_at=datetime.now(timezone.utc),
        error_message=error_message,
    )
    db.add(event)
    await db.commit()
