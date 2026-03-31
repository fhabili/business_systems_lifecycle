"""
BIS LBS ingestor — reads 3 BIS Locational Banking Statistics CSV files.

Confirmed source format (from file inspection):
  Row 0: 15 metadata column headers (Publication Table, Period, etc.)
  Row 1: metadata values — col[0]=table_id, col[2]=period (e.g. "2025-Q3")
  Row 2: blank
  Row 3: sector-group header row (All sectors, Bank sector, Non-bank sector, Unallocated)
  Row 4: subgroup header row (Total, Of which: Intragroup, ...)
  Row 5: Claims/Liabilities header row
  Row 6+: data rows — col[0]=counterparty name, cols[1+]=numeric values

  Files:
    raw_bis_lbs_a1.csv — Summary by currency, instrument, counterparty sector
    raw_bis_lbs_a2.csv — By location of reporting bank and sector of counterparty
    raw_bis_lbs_a3.csv — By sector of counterparty and currency side

Melt strategy: one staging row per (counterparty_country, sector_type, position_type)
  sector_type    <- propagated group + sub-group header from rows 3 and 4
  instrument_type <- "Claims" or "Liabilities" from row 5
  reporting_country <- "All LBS reporting countries" (not broken out at this level)
"""
import csv
import json
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staging import BisLbsRaw, FileLoad

RAW_DIR = Path(__file__).resolve().parents[3] / "data" / "raw" / "bis"
BATCH_SIZE = 500


def _build_col_labels(header_rows: list[list[str]]) -> list[tuple[str, str] | None]:
    """
    Build (sector_type, position_type) label for each data column (index 1+)
    from three header rows [sector_group_row, subgroup_row, claims_liabilities_row].
    Returns a list aligned to column positions starting at index 1.
    None entries indicate columns without a usable Claims/Liabilities label.
    """
    sector_row   = header_rows[0] if len(header_rows) > 0 else []
    subgroup_row = header_rows[1] if len(header_rows) > 1 else []
    position_row = header_rows[2] if len(header_rows) > 2 else []

    max_len = max(len(sector_row), len(subgroup_row), len(position_row))
    labels: list[tuple[str, str] | None] = []
    current_sector   = ""
    current_subgroup = ""

    for i in range(1, max_len):  # col 0 = country/category identifier
        s  = sector_row[i].strip()   if i < len(sector_row)   else ""
        sg = subgroup_row[i].strip() if i < len(subgroup_row) else ""
        p  = position_row[i].strip() if i < len(position_row) else ""

        if s:
            current_sector   = s
            current_subgroup = ""
        if sg:
            current_subgroup = sg

        if p in ("Claims", "Liabilities"):
            sec = f"{current_sector} — {current_subgroup}".strip(" —") if current_subgroup else current_sector
            labels.append((sec, p))
        else:
            labels.append(None)

    return labels


async def ingest(db: AsyncSession, run_id: int | None = None) -> int:
    """
    Load all BIS LBS CSV files into staging.bis_lbs_raw.
    Melts wide format (country rows x sector/position columns) to long format.
    Returns total rows inserted.
    """
    total_inserted = 0

    for path in sorted(RAW_DIR.glob("*.csv")):
        # Derive table type from filename stem (a1 / a2 / a3)
        table_type = next((p for p in path.stem.split("_") if p in ("a1", "a2", "a3")), "unknown")

        file_load = FileLoad(filename=path.name, source="bis", status="loading")
        db.add(file_load)
        await db.flush()

        try:
            with open(path, encoding="utf-8-sig", newline="") as f:
                all_rows = list(csv.reader(f))

            # Period is in row 1 (metadata values), column index 2
            ref_period = all_rows[1][2].strip() if len(all_rows) > 1 and len(all_rows[1]) > 2 else None

            # Column labels from rows 3 (sector), 4 (subgroup), 5 (Claims/Liabilities)
            col_labels = _build_col_labels(all_rows[3:6])

            rows: list[BisLbsRaw] = []
            row_count = 0

            for data_row in all_rows[6:]:  # data starts at row index 6
                if not data_row or not data_row[0].strip():
                    continue
                country = data_row[0].strip()

                for j, label in enumerate(col_labels):
                    if label is None:
                        continue
                    col_idx = j + 1
                    if col_idx >= len(data_row):
                        continue

                    val_str = data_row[col_idx].strip().replace(",", "")
                    if not val_str or val_str in ("\\", "-", "nan", ""):
                        continue
                    try:
                        obs_value = float(val_str)
                    except ValueError:
                        continue

                    sector_type, position_type = label
                    rows.append(BisLbsRaw(
                        file_load_id=file_load.id,
                        ref_period=ref_period,
                        reporting_country="All LBS reporting countries",
                        counterparty_country=country,
                        sector_type=sector_type,
                        instrument_type=position_type,  # "Claims" or "Liabilities"
                        obs_value=obs_value,
                        raw_json=json.dumps({
                            "table": table_type,
                            "period": ref_period,
                            "counterparty": country,
                            "sector": sector_type,
                            "position": position_type,
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
