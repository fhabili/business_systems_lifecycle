"""
Pydantic schemas for the /api/v1/summary endpoint.
These define the exact JSON shape the frontend receives.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LcrTrendPoint(BaseModel):
    """One data point for the LCR trend sparkline on the Executive Summary tab."""
    period: str           # e.g. "2023-Q4"
    lcr_ratio: float      # percentage value


class NsfrTrendPoint(BaseModel):
    """One data point for the NSFR trend on the Executive Summary tab."""
    period: str
    nsfr_ratio: float     # percentage value


class SummaryResponse(BaseModel):
    lcr_ratio: Optional[float] = None          # latest average LCR across all banks (%)
    nsfr_ratio: Optional[float] = None         # latest average NSFR across all banks (%)
    data_quality_score: Optional[float] = None # % of records passing all validation rules
    as_of_date: Optional[str] = None           # most recent reference_date in warehouse
    last_pipeline_run: Optional[datetime] = None
    lcr_trend: list[LcrTrendPoint] = []        # for the area chart
    nsfr_trend: list[NsfrTrendPoint] = []      # for the NSFR average calculation
    active_alerts: list[str] = []              # human-readable alert strings for the warning banner
