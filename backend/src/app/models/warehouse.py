"""
Warehouse layer models — cleaned, standardised, and classified data ready for reporting.
Basel III mapping rules (HQLA classification, haircut factors, maturity bucketing) are
applied here. This is what analysts query to build dashboards.
"""
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class BankLcr(Base):
    """
    LCR (Liquidity Coverage Ratio) per bank per reporting date.
    Derived from EBA transparency data and ECB supervisory series.
    LCR = HQLA / Net Cash Outflows (30-day stress) — minimum 100% under Basel III.
    """
    __tablename__ = "bank_lcr"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bank_id: Mapped[str] = mapped_column(String(100), nullable=False)
    bank_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    reference_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    hqla_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)   # High Quality Liquid Assets, EUR millions
    net_outflow: Mapped[Optional[float]] = mapped_column(Float, nullable=True)   # Net stressed outflow, EUR millions
    lcr_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)     # Percentage, e.g. 142.0
    source: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)     # 'eba' | 'ecb_sup'
    loaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BankNsfr(Base):
    """
    NSFR (Net Stable Funding Ratio) per bank per reporting date.
    NSFR = Available Stable Funding / Required Stable Funding — minimum 100% under Basel III.
    Measures structural liquidity over a 1-year horizon (vs LCR's 30-day horizon).
    """
    __tablename__ = "bank_nsfr"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bank_id: Mapped[str] = mapped_column(String(100), nullable=False)
    bank_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    reference_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    asf_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)    # Available Stable Funding, EUR millions
    rsf_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)    # Required Stable Funding, EUR millions
    nsfr_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)    # Percentage, e.g. 108.0
    source: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    loaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SupervisorySeries(Base):
    """
    ECB supervisory time-series observations after cleaning and classification.
    Each row is one data point: metric × reporting area × period → value.
    Used for trend charts and cross-country comparison in the dashboard.
    """
    __tablename__ = "supervisory_series"
    __table_args__ = {"schema": "warehouse"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    series_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ref_area: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)   # Country / aggregate code
    freq: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    ref_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # Human-readable period string
    period_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)     # Parsed as actual date for sorting
    metric_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # e.g. 'LCR', 'NSFR', 'CET1_RATIO'
    obs_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    loaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
