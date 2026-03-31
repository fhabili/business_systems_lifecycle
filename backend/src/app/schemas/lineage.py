"""
Pydantic schemas for the /api/v1/lineage endpoint.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LayerEventRow(BaseModel):
    """One layer's execution record within a pipeline run."""
    layer: str                           # 'staging' | 'warehouse' | 'validation'
    source_name: Optional[str] = None    # 'ecb_sup' | 'eba' | 'bista'
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    rows_in: Optional[int] = None
    rows_out: Optional[int] = None
    status: str                          # 'success' | 'failed'
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


class PipelineRunRow(BaseModel):
    """One full pipeline run with all its per-layer events nested inside."""
    id: int
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    status: str
    trigger: Optional[str] = None
    events: list[LayerEventRow] = []


class LineageResponse(BaseModel):
    runs: list[PipelineRunRow] = []
    latest_run_id: Optional[int] = None
