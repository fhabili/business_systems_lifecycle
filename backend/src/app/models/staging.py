"""
Staging layer models — raw data loaded exactly as it arrives from each source.
Nothing is transformed here. Think of it as a locked archive: auditors can always
trace any warehouse or reporting number back to the original raw row.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class FileLoad(Base):
    """
    One row per file ingested into the system.
    Records the filename, source system, timestamp, row count, and whether it succeeded.
    This is the entry point of the entire audit trail.
    """
    __tablename__ = "file_loads"
    __table_args__ = {"schema": "staging"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)        # 'ecb_sup' | 'bista' | 'bis' | 'ecb_eurosystem'
    loaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    row_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="loaded")  # 'loaded' | 'failed'
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class EcbSupRaw(Base):
    """
    Raw ECB supervisory (SUP) time-series observations.
    One row = one observation: series_key × ref_period → obs_value.
    The full original row is preserved in raw_json so nothing is ever lost.
    """
    __tablename__ = "ecb_sup_raw"
    __table_args__ = {"schema": "staging"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_load_id: Mapped[int] = mapped_column(Integer, ForeignKey("staging.file_loads.id"), nullable=False)
    series_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ref_area: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)   # e.g. "DE", "FR"
    freq: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)       # e.g. "Q" (quarterly)
    ref_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # e.g. "2023-Q4"
    obs_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    raw_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)         # full original row


class BistaRaw(Base):
    """
    Raw BISTA banking statistics observations (Deutsche Bundesbank structured data).
    Row grain: BAID × YEAR × MONTH — one row per bank per month.
    Only the 15 selected columns are loaded (5 identity + 11 balance-sheet metrics).
    Source codes mapped to human-readable aliases on ingest.
    """
    __tablename__ = "bista_raw"
    __table_args__ = {"schema": "staging"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_load_id: Mapped[int] = mapped_column(Integer, ForeignKey("staging.file_loads.id"), nullable=False)

    # --- Identity columns ---
    baid: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)   # BAID  — bank identifier
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)      # YEAR  — reporting year
    month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)     # MONTH — reporting month (1-12)
    day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)       # DAY   — reporting day
    inty: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)   # INTY  — institution type code

    # --- Balance-sheet columns (source code → alias) ---
    total_assets: Mapped[Optional[float]] = mapped_column(Float, nullable=True)          # A1_100_01 — total assets
    cash_central_bank: Mapped[Optional[float]] = mapped_column(Float, nullable=True)     # A1_110_01 — cash & central bank deposits
    loans_to_mfi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)          # A1_120_01 — loans to MFIs
    loans_to_non_mfi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)      # A1_120_05 — loans to non-MFIs
    deposits_from_mfi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)     # A2_100_01 — deposits from MFIs
    deposits_from_non_mfi: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # A2_110_01 — deposits from non-MFIs
    debt_securities_issued: Mapped[Optional[float]] = mapped_column(Float, nullable=True)# A2_120_01 — debt securities issued
    repos_short_term: Mapped[Optional[float]] = mapped_column(Float, nullable=True)      # A2_200_02 — repos / short-term
    capital_reserves: Mapped[Optional[float]] = mapped_column(Float, nullable=True)      # A3_100_01 — total capital & reserves
    subscribed_capital: Mapped[Optional[float]] = mapped_column(Float, nullable=True)    # A3_110_01 — subscribed capital
    reserves: Mapped[Optional[float]] = mapped_column(Float, nullable=True)              # A3_120_01 — reserves

    raw_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)     # Selected 15-column row preserved as JSON


class BisLbsRaw(Base):
    """
    Raw BIS Locational Banking Statistics (LBS) observations.
    One row = one cross-border claims/liabilities observation by country, sector, instrument.
    Quarterly data with breakdowns: reporting country × counterparty country × sector type × instrument type.
    """
    __tablename__ = "bis_lbs_raw"
    __table_args__ = {"schema": "staging"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_load_id: Mapped[int] = mapped_column(Integer, ForeignKey("staging.file_loads.id"), nullable=False)
    ref_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)   # e.g. "2023-Q4"
    reporting_country: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    counterparty_country: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    sector_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # "Banks", "Non-Banks", etc.
    instrument_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # "Loans", "Deposits", "Debt Securities", etc.
    obs_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Amount in USD millions
    raw_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class EcbEurosystemRaw(Base):
    """
    Raw ECB Eurosystem balance sheet (monetary policy operations) observations.
    One row = one asset/liability item at one balance sheet date.
    Weekly and monthly snapshots of central bank liquidity, asset holdings, and liabilities.
    """
    __tablename__ = "ecb_eurosystem_raw"
    __table_args__ = {"schema": "staging"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_load_id: Mapped[int] = mapped_column(Integer, ForeignKey("staging.file_loads.id"), nullable=False)
    ref_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # e.g. "2023-11-01" for weekly, "2023-11" for monthly
    freq: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # "W" (weekly) or "M" (monthly)
    item_code: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)  # Coded item identifier
    item_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # Human-readable item label
    balance_sheet_side: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # "Assets" | "Liabilities"
    obs_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Amount in EUR millions
    raw_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
