"""
EBA ingestor — DROPPED.

Reason: The file raw_eba_transparency_2025_raq_statistical_annex.xlsx was inspected
and confirmed to be an EBA Risk Assessment Questionnaire (RAQ — survey data), NOT
bank supervisory or disclosure data suitable for this pipeline.

This ingestor and the eba_raw staging table have been removed from the data plan.
Do not implement or use this module.

If a different EBA source (e.g., EBA Transparency Exercise supervisory data) becomes
available in the future, a new ingestor should be created from scratch with the
correct column mappings.
"""
import json
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staging import EbaRaw, FileLoad

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "eba"


async def ingest(db: AsyncSession, run_id: int | None = None) -> int:
    """
    Read the EBA XLSX file and load each metric observation into staging.eba_raw.
    Returns total rows inserted.

    Steps:
      1. Open XLSX with openpyxl / pandas
      2. Identify the correct sheet (may need to inspect header row)
      3. Melt wide → long format: one row per bank × metric × date
      4. Insert into staging.eba_raw with raw_json preserved
    """
    # TODO: implement once XLSX column headers are confirmed from the real file.
    raise NotImplementedError(
        f"EBA ingestor not yet implemented.\n"
        f"Drop the XLSX file into {RAW_DIR}\n"
        f"Then inspect the header row and fill in column names."
    )
