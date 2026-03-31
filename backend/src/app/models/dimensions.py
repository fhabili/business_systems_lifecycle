"""
Dimension tables — slowly-changing dimensions (SCD) that provide context for facts.
These are shared reference tables that support fact tables across all reporting layers.
Updated rarely, versioned for audit trail.

The four core dimensions are:
  dim_entity:  banks, countries, regulatory authorities
  dim_period:  calendar periods (quarters, months, weeks) with standardized parsing
  dim_metric:  metrics (LCR, NSFR, CET1_RATIO, etc.) with definitions and thresholds
  dim_source:  data sources (ECB SUP, EBA, BISTA, BIS, etc.) with load SLAs
"""
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DimEntity(Base):
    """
    Dimension: Entity (bank, country, institution).
    Covers supervisory entities (banks), regions, and reporting aggregates.
    SCD Type 2: slow-changing (version rows when properties change).
    """
    __tablename__ = "dim_entity"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_key: Mapped[str] = mapped_column(String(100), nullable=False)  # Surrogate key: natural ID
    entity_name: Mapped[str] = mapped_column(String(500), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "Bank" | "Country" | "Aggregate"
    country_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # ISO-2
    lei: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # Legal Entity Identifier for banks
    bic: Mapped[Optional[str]] = mapped_column(String(11), nullable=True)  # Bank Identifier Code
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # "eba" | "ecb" | "bis" | "bista"
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)  # SCD Type 2: version start date
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)  # SCD Type 2: NULL = current version
    is_current: Mapped[bool] = mapped_column(Integer, nullable=False, default=True)  # Flag for easy filtering
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DimPeriod(Base):
    """
    Dimension: Reporting Period.
    Standardizes all period strings (quarterly, monthly, weekly) to calendar dates.
    Enables seamless joining across sources with different frequency conventions.
    """
    __tablename__ = "dim_period"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    period_key: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)  # e.g. "2023-Q4" or "2023-11"
    period_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    period_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    frequency: Mapped[str] = mapped_column(String(10), nullable=False)  # "W" | "M" | "Q" | "A"
    frequency_label: Mapped[str] = mapped_column(String(20), nullable=False)  # "Weekly" | "Monthly" | "Quarterly" | "Annual"
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    quarter: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-4, NULL if not quarterly
    month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-12, NULL if not monthly
    week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-52, NULL if not weekly
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DimMetric(Base):
    """
    Dimension: Metric and its regulatory context.
    Defines every KPI, rule, and threshold used in reporting.
    Links to regulatory definitions (e.g., LCR minimum 100%) and stewards (who maintains it).
    """
    __tablename__ = "dim_metric"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    metric_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)  # e.g. "LCR", "NSFR", "CET1_RATIO"
    metric_name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metric_category: Mapped[str] = mapped_column(String(50), nullable=False)  # "Liquidity" | "Capital" | "Profitability" | "Balance_Sheet"
    unit: Mapped[str] = mapped_column(String(20), nullable=False)  # "Ratio" | "Percentage" | "EUR_Millions" | "Count"
    regulatory_framework: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # "Basel III" | "IFRS" | "COREP"
    minimum_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # e.g. 100.0 for LCR ratio
    maximum_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    metric_steward: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Team or role owner
    active: Mapped[bool] = mapped_column(Integer, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DimSource(Base):
    """
    Dimension: Data Source and its operational characteristics.
    Defines where data comes from, how fresh it is, and who provides it.
    Used for data provenance, SLA tracking, and source credibility scoring.
    """
    __tablename__ = "dim_source"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)  # "ecb_sup" | "eba" | "bista" | "bis" | "ecb_eurosystem"
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)  # "ECB" | "EBA" | "Bundesbank" | "BIS"
    frequency: Mapped[str] = mapped_column(String(10), nullable=False)  # "W" | "M" | "Q" | "A"
    typical_lag_days: Mapped[int] = mapped_column(Integer, nullable=False)  # How many days after period-end does data arrive?
    file_format: Mapped[str] = mapped_column(String(50), nullable=False)  # "CSV" | "XLSX" | "XML" | "DTA" | "JSON"
    grain: Mapped[str] = mapped_column(String(255), nullable=False)  # "Observation-level series" | "Bank-level snapshot" | "Monthly balance-sheet" | "Country/instrument"
    coverage_scope: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # "EU27 banks" | "German banking sector" | "Global cross-border" | etc.
    data_quality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0-100, from validation history
    is_active: Mapped[bool] = mapped_column(Integer, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
