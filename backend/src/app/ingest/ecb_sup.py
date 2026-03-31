"""
ECB SUP ingestor — reads 6 quarterly supervisory metric CSV files.

Confirmed source format (from file inspection):
  Row 0: header — "DATE", "TIME PERIOD", "<metric description with series key>"
  Row 1+: quarterly observations, e.g. "2016-09-30","2016Q3","137.64"
  One metric per file; aggregate EU-wide (no country breakdown).

Filename → metric_name mapping:
  ecb_sup_lcr_ratio.csv    → LCR_RATIO
  ecb_sup_nsfr_ratio.csv   → NSFR_RATIO
  ecb_sup_lcr_buffer.csv   → LCR_BUFFER
  ecb_sup_lcr_outflow.csv  → LCR_OUTFLOW
  ecb_sup_nsfr_asf.csv     → NSFR_ASF
  ecb_sup_nsfr_rsf.csv     → NSFR_RSF
"""
import csv
import json
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staging import EcbSupRaw, FileLoad

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "ecb_sup"
BATCH_SIZE = 500

FILENAME_TO_METRIC: dict[str, str] = {
    "ecb_sup_lcr_ratio":   "LCR_RATIO",
    "ecb_sup_nsfr_ratio":  "NSFR_RATIO",
    "ecb_sup_lcr_buffer":  "LCR_BUFFER",
    "ecb_sup_lcr_outflow": "LCR_OUTFLOW",
    "ecb_sup_nsfr_asf":    "NSFR_ASF",
    "ecb_sup_nsfr_rsf":    "NSFR_RSF",
}


async def ingest(db: AsyncSession, run_id: int | None = None) -> int:
    """
    Load all 6 ECB SUP CSV files into staging.ecb_sup_raw.
    Returns total rows inserted.
    """
    total_inserted = 0

    for path in sorted(RAW_DIR.glob("*.csv")):
        metric_name = FILENAME_TO_METRIC.get(path.stem)
        if metric_name is None:
            continue  # skip unknown files

        file_load = FileLoad(filename=path.name, source="ecb_sup", status="loading")
        db.add(file_load)
        await db.flush()

        try:
            with open(path, encoding="utf-8-sig", newline="") as f:
                reader = csv.reader(f)
                header = next(reader)  # DATE, TIME PERIOD, <metric description>
                value_col_desc = header[2] if len(header) > 2 else "value"

                rows: list[EcbSupRaw] = []
                row_count = 0

                for line in reader:
                    if not line:
                        continue
                    date_str   = line[0].strip() if len(line) > 0 else None
                    ref_period = line[1].strip() if len(line) > 1 else None
                    val_str    = line[2].strip() if len(line) > 2 else None

                    obs_value: float | None = None
                    if val_str:
                        try:
                            obs_value = float(val_str.replace(",", ""))
                        except ValueError:
                            pass

                    rows.append(EcbSupRaw(
                        file_load_id=file_load.id,
                        series_key=metric_name,
                        ref_area=None,      # aggregate EU-wide; no country breakdown
                        freq="Q",
                        ref_period=ref_period,
                        obs_value=obs_value,
                        raw_json=json.dumps({
                            "DATE": date_str,
                            "TIME_PERIOD": ref_period,
                            "metric": value_col_desc,
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
