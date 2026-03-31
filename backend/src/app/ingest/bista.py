"""
BISTA ingestor — reads Deutsche Bundesbank BISTA banking statistics Stata files.

Confirmed source format (from file inspection):
  Stata binary files (.dta), monthly frequency, 1999-present.
  Two reporting-format vintages:
    _9918_cre/  → Pre-2020 format, uncompressed .dta
    _9919_cre/  → Post-2020 format, .dta for mof series, .dta.gz for dom series

  Row grain: BAID × YEAR × MONTH (one row per bank per calendar month)

Selected columns (15 of ~396):
  Identity:  BAID, YEAR, MONTH, DAY, INTY
  A-side:    A1_100_01 (total_assets), A1_110_01 (cash_central_bank),
             A1_120_01 (loans_to_mfi), A1_120_05 (loans_to_non_mfi)
  L-side:    A2_100_01 (deposits_from_mfi), A2_110_01 (deposits_from_non_mfi),
             A2_120_01 (debt_securities_issued), A2_200_02 (repos_short_term)
  Equity:    A3_100_01 (capital_reserves), A3_110_01 (subscribed_capital),
             A3_120_01 (reserves)
"""
import gzip
import io
import json
from pathlib import Path
from typing import Iterator
import pyreadstat
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.models.staging import BistaRaw, FileLoad

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "bista"
VINTAGE_DIRS = ["_9918_cre", "_9919_cre"]
BATCH_SIZE = 500

# Source column → model attribute alias
COLUMN_MAP: dict[str, str] = {
    "BAID": "baid",
    "YEAR": "year",
    "MONTH": "month",
    "DAY": "day",
    "INTY": "inty",
    "A1_100_01": "total_assets",
    "A1_110_01": "cash_central_bank",
    "A1_120_01": "loans_to_mfi",
    "A1_120_05": "loans_to_non_mfi",
    "A2_100_01": "deposits_from_mfi",
    "A2_110_01": "deposits_from_non_mfi",
    "A2_120_01": "debt_securities_issued",
    "A2_200_02": "repos_short_term",
    "A3_100_01": "capital_reserves",
    "A3_110_01": "subscribed_capital",
    "A3_120_01": "reserves",
}
SELECT_COLS = list(COLUMN_MAP.keys())


def _read_dta(path: Path) -> pd.DataFrame:
    """Read a .dta or .dta.gz file, selecting only the 15 target columns.
    Columns missing from a particular vintage are silently skipped."""
    present = []
    # First pass: discover which of our columns actually exist in this file
    if path.suffix == ".gz":
        with gzip.open(path, "rb") as gz:
            _, meta = pyreadstat.read_dta(io.BytesIO(gz.read()), metadataonly=True)
    else:
        _, meta = pyreadstat.read_dta(path, metadataonly=True)
    present = [c for c in SELECT_COLS if c in meta.column_names]

    # Second pass: read only the present columns
    if path.suffix == ".gz":
        with gzip.open(path, "rb") as gz:
            df, _ = pyreadstat.read_dta(io.BytesIO(gz.read()), usecols=present)
    else:
        df, _ = pyreadstat.read_dta(path, usecols=present)
    return df


def _iter_files() -> Iterator[Path]:
    """Yield all .dta and .dta.gz files from both vintage subdirectories."""
    for vintage in VINTAGE_DIRS:
        folder = RAW_DIR / vintage
        if not folder.exists():
            continue
        for path in sorted(folder.iterdir()):
            if path.name.endswith(".dta") or path.name.endswith(".dta.gz"):
                yield path


async def ingest(db: AsyncSession, run_id: int | None = None) -> int:
    """
    Read all BISTA .dta/.dta.gz files from both vintage folders and load
    selected columns into staging.bista_raw.
    Returns total rows inserted across all files.
    """
    total_inserted = 0

    for path in _iter_files():
        # Create audit entry before attempting to read
        file_load = FileLoad(
            filename=path.name,
            source="bista",
            status="loading",
        )
        db.add(file_load)
        await db.flush()  # get file_load.id

        try:
            df = _read_dta(path)

            # Rename source columns to model aliases
            rename = {src: alias for src, alias in COLUMN_MAP.items() if src in df.columns}
            df = df.rename(columns=rename)

            rows: list[BistaRaw] = []
            for record in df.to_dict(orient="records"):
                # Coerce numpy scalar types to native Python for JSON serialisation
                clean = {k: (v.item() if hasattr(v, "item") else v) for k, v in record.items()}
                rows.append(BistaRaw(
                    file_load_id=file_load.id,
                    baid=clean.get("baid"),
                    year=int(clean["year"]) if clean.get("year") is not None else None,
                    month=int(clean["month"]) if clean.get("month") is not None else None,
                    day=int(clean["day"]) if clean.get("day") is not None else None,
                    inty=str(clean["inty"]) if clean.get("inty") is not None else None,
                    total_assets=clean.get("total_assets"),
                    cash_central_bank=clean.get("cash_central_bank"),
                    loans_to_mfi=clean.get("loans_to_mfi"),
                    loans_to_non_mfi=clean.get("loans_to_non_mfi"),
                    deposits_from_mfi=clean.get("deposits_from_mfi"),
                    deposits_from_non_mfi=clean.get("deposits_from_non_mfi"),
                    debt_securities_issued=clean.get("debt_securities_issued"),
                    repos_short_term=clean.get("repos_short_term"),
                    capital_reserves=clean.get("capital_reserves"),
                    subscribed_capital=clean.get("subscribed_capital"),
                    reserves=clean.get("reserves"),
                    raw_json=json.dumps(clean),
                ))

                if len(rows) >= BATCH_SIZE:
                    db.add_all(rows)
                    await db.flush()
                    total_inserted += len(rows)
                    rows = []

            if rows:
                db.add_all(rows)
                await db.flush()
                total_inserted += len(rows)

            # Mark file_load as loaded
            file_load.row_count = len(df)
            file_load.status = "loaded"

        except Exception as exc:
            file_load.status = "failed"
            file_load.error_message = str(exc)[:1000]
            await db.flush()
            # Continue to next file — one bad file must not abort the entire run
            continue

    await db.commit()
    return total_inserted
