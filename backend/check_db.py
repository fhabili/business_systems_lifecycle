"""Quick sanity check: list all tables and row counts in the app schemas."""
import asyncio
import asyncpg


async def main():
    conn = await asyncpg.connect(
        "postgresql://postgres:040393@localhost:5432/liquidity_risk"
    )

    # Tables
    rows = await conn.fetch(
        "SELECT schemaname, tablename FROM pg_tables "
        "WHERE schemaname IN ('staging','warehouse','lineage','validation') "
        "ORDER BY schemaname, tablename"
    )
    if not rows:
        print("NO TABLES FOUND in staging/warehouse/lineage/validation schemas.")
    else:
        print(f"{'Schema':<15} {'Table':<30}")
        print("-" * 45)
        for r in rows:
            print(f"  {r['schemaname']:<13} {r['tablename']}")

    # Row counts for key tables
    print()
    targets = [
        ("staging", "ecb_sup_raw"),
        ("staging", "bista_raw"),
        ("staging", "bis_lbs_raw"),
        ("staging", "ecb_eurosystem_raw"),
        ("warehouse", "supervisory_series"),
        ("warehouse", "bank_lcr"),
        ("warehouse", "bank_nsfr"),
    ]
    print(f"{'Table':<40} {'Rows':>8}")
    print("-" * 50)
    for schema, table in targets:
        try:
            n = await conn.fetchval(f"SELECT COUNT(*) FROM {schema}.{table}")
            print(f"  {schema}.{table:<36} {n:>8,}")
        except Exception as e:
            print(f"  {schema}.{table:<36} {'MISSING':>8}  ({e})")

    await conn.close()


asyncio.run(main())
