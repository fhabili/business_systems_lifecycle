"""
Lineage layer models — every step of every pipeline run is logged here.
This is the audit trail that makes the system explainable to regulators and auditors.
A BSA / systems analyst owns this layer: it answers "what ran, when, on what data?"
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class PipelineRun(Base):
    """
    One row per full execution of the ingestion pipeline.
    Tracks when it started, when it finished, and whether it succeeded.
    Think of this as a job log in an ERP scheduler (like SAP SM37).
    """
    __tablename__ = "pipeline_runs"
    __table_args__ = {"schema": "lineage"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="running")  # 'running' | 'success' | 'failed'
    trigger: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)           # 'manual' | 'scheduled'
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class LayerEvent(Base):
    """
    One row per layer per pipeline run.
    Records how many rows entered a layer (rows_in), how many came out (rows_out),
    and whether it succeeded. If rows_in != rows_out, the discrepancy is traceable.
    This is the "step-by-step trace" that makes the Data Lineage tab meaningful.
    """
    __tablename__ = "layer_events"
    __table_args__ = {"schema": "lineage"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("lineage.pipeline_runs.id"), nullable=False)
    layer: Mapped[str] = mapped_column(String(20), nullable=False)               # 'staging' | 'warehouse' | 'validation'
    source_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # 'ecb_sup' | 'eba' | 'bista'
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rows_in: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rows_out: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="success")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
