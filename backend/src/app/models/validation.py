"""
Validation layer models — business rules and their results.
Rules are defined once (rule_definitions) and evaluated on every pipeline run (rule_results).
A failed rule does NOT silently drop data — it is logged here with timestamps.
Compliance and Risk teams own this layer: they define what "correct" means.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class RuleDefinition(Base):
    """
    Catalogue of all validation rules that the system knows about.
    Rules are loaded once via seed_rules() and don't change unless a business analyst updates them.
    Example: DQ-001 'Missing Bank Identifier' — Critical severity.
    """
    __tablename__ = "rule_definitions"
    __table_args__ = {"schema": "validation"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rule_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # e.g. 'DQ-001'
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)                # 'Critical' | 'High' | 'Medium' | 'Low'
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class RuleResult(Base):
    """
    Result of one rule firing against one pipeline run's data.
    records_checked = total rows evaluated
    records_passed  = rows that satisfied the rule
    records_failed  = rows that violated the rule (logged, not deleted)
    sample_failures = JSON string with up to 10 example failing rows for investigation
    """
    __tablename__ = "rule_results"
    __table_args__ = {"schema": "validation"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("lineage.pipeline_runs.id"), nullable=False)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey("validation.rule_definitions.id"), nullable=False)
    records_checked: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_passed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_failed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    sample_failures: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
