"""
ECB Eurosystem Balance Sheet ingestor — reads the annual consolidated balance sheet CSV.

Confirmed source format (from file inspection):
  Rows 0-3: title / blank (skip)
  Row 4:    header row — first col = "Assets" label, remaining cols = year labels
             e.g. "Balance as at 31 December 1999" ... "Balance as at 31 December 2025"
             Some headers contain embedded newlines in quoted cells.
  Row 5+:   data rows — first col = item name (with leading BOM/junk chars),
             remaining cols = numeric values in EUR millions.

  Balance-sheet side:
    Starts as "Assets". Switches to "Liabilities" when a row whose item name
    starts with "Liabilities" (case-insensitive) is encountered.
    "Total assets" and "Total liabilities" rows are section footers and skipped.

  Item codes: extracted from the leading digit prefix, e.g. "1", "2.1", "5.3".
  Leading BOM artefact characters are stripped before parsing.
"""
import json
import re
from pathlib import Path
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staging import EcbEurosystemRaw, FileLoad

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "ecb_eurosystem"
BATCH_SIZE = 500

_ITEM_CODE_PAT = re.compile(r'^([\d]+(?:[,\.\d]+)*)\.?\s+(.+)$')
_YEAR_PAT      = re.compile(r'(\d{4})\s*$')


def _extract_year(col_name: str) -> str | None:
    """Pull 4-digit year from 'Balance as at 31 December YYYY' (handles embedded \\n)."""
    m = _YEAR_PAT.search(str(col_name).replace("\n", " "))
    return m.group(1) if m else None


def _clean_item(raw: str) -> str:
    """Strip leading BOM artefacts and whitespace."""
    return re.sub(r'^[^\w\d]+', '', raw).strip()


async def ingest(db: AsyncSession, run_id: int | None = None) -> int:
    """
    Load the ECB Eurosystem annual balance sheet CSV into staging.ecb_eurosystem_raw.
    Melts wide format (item rows x year columns) to long format.
    Returns total rows inserted.
    """
    total_inserted = 0

    for path in sorted(RAW_DIR.glob("*.csv")):
        file_load = FileLoad(filename=path.name, source="ecb_eurosystem", status="loading")
        db.add(file_load)
        await db.flush()

        try:
            # skiprows=4 skips 4 title/blank rows; try utf-8-sig first, fall back to latin-1
            try:
                df = pd.read_csv(path, skiprows=4, encoding="utf-8-sig", dtype=str)
            except UnicodeDecodeError:
                df = pd.read_csv(path, skiprows=4, encoding="latin-1", dtype=str)

            item_col  = df.columns[0]
            year_cols = {col: yr for col in df.columns[1:]
                         if (yr := _extract_year(col)) is not None}

            rows: list[EcbEurosystemRaw] = []
            row_count    = 0
            current_side = "Assets"

            for _, df_row in df.iterrows():
                raw_item = str(df_row[item_col]) if pd.notna(df_row[item_col]) else ""
                if not raw_item or raw_item == "nan":
                    continue

                item_clean = _clean_item(raw_item)
                item_lower = item_clean.lower()

                # Section-transition / footer rows — not real data
                if "total assets" in item_lower:
                    continue
                if item_lower.startswith("liabilities"):
                    current_side = "Liabilities"
                    continue
                if "total liabilities" in item_lower:
                    continue

                m = _ITEM_CODE_PAT.match(item_clean)
                item_code = m.group(1) if m else None
                item_name = m.group(2).strip() if m else item_clean

                for col, year in year_cols.items():
                    val_str = str(df_row[col]).strip() if pd.notna(df_row[col]) else ""
                    if not val_str or val_str in ("", "nan", "-"):
                        continue
                    try:
                        obs_value = float(val_str.replace(",", ""))
                    except ValueError:
                        continue

                    rows.append(EcbEurosystemRaw(
                        file_load_id=file_load.id,
                        ref_period=year,
                        freq="A",
                        item_code=item_code,
                        item_name=item_name,
                        balance_sheet_side=current_side,
                        obs_value=obs_value,
                        raw_json=json.dumps({
                            "item_raw": raw_item,
                            "item_code": item_code,
                            "side": current_side,
                            "year": year,
                            "obs_value": obs_value,
                        }),
                    ))
                    row_count += 1

                    if len(rows) >= BATCH_SIZE:
                        db.add_all(rows)
                        await db.flush()
                        total_inserted += len(rows)
                        rows = []

            if rows:
                db.add_all(rows)
                await db.flush()
                total_inserted += len(rows)

            file_load.row_count = row_count
            file_load.status = "loaded"

        except Exception as exc:
            file_load.status = "failed"
            file_load.error_message = str(exc)[:1000]
            await db.flush()
            continue

    await db.commit()
    return total_inserted
