"""Add new sources (BIS LBS, ECB Eurosystem) and dimension tables; update BistaRaw

Revision ID: 002_add_new_sources_and_dims
Revises: 001_initial
Create Date: 2026-03-31
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text

revision = "002_add_new_sources_and_dims"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def _table_exists(schema, table):
    bind = op.get_bind()
    result = bind.execute(text(
        "SELECT 1 FROM information_schema.tables "
        "WHERE table_schema=:s AND table_name=:t"
    ), {"s": schema, "t": table})
    return result.fetchone() is not None


def _column_exists(schema, table, column):
    bind = op.get_bind()
    result = bind.execute(text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_schema=:s AND table_name=:t AND column_name=:c"
    ), {"s": schema, "t": table, "c": column})
    return result.fetchone() is not None


def upgrade() -> None:
    # Drop EBA if it still exists
    if _table_exists("staging", "eba_raw"):
        op.drop_table("eba_raw", schema="staging")

    # Update BistaRaw: remove old cols if present, add new ones if missing
    for col in ("ref_period", "series_key", "obs_value"):
        if _column_exists("staging", "bista_raw", col):
            op.drop_column("bista_raw", col, schema="staging")

    new_cols = [
        ("baid",                   sa.String(50)),
        ("year",                   sa.Integer()),
        ("month",                  sa.Integer()),
        ("day",                    sa.Integer()),
        ("inty",                   sa.String(50)),
        ("total_assets",           sa.Float()),
        ("cash_central_bank",      sa.Float()),
        ("loans_to_mfi",           sa.Float()),
        ("loans_to_non_mfi",       sa.Float()),
        ("deposits_from_mfi",      sa.Float()),
        ("deposits_from_non_mfi",  sa.Float()),
        ("debt_securities_issued", sa.Float()),
        ("repos_short_term",       sa.Float()),
        ("capital_reserves",       sa.Float()),
        ("subscribed_capital",     sa.Float()),
        ("reserves",               sa.Float()),
    ]
    for col_name, col_type in new_cols:
        if not _column_exists("staging", "bista_raw", col_name):
            op.add_column("bista_raw", sa.Column(col_name, col_type, nullable=True), schema="staging")

    # Create bis_lbs_raw if not exists
    if not _table_exists("staging", "bis_lbs_raw"):
        op.create_table(
            "bis_lbs_raw",
            sa.Column("id",                   sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("file_load_id",         sa.Integer, sa.ForeignKey("staging.file_loads.id"), nullable=False),
            sa.Column("ref_period",           sa.String(20),  nullable=True),
            sa.Column("reporting_country",    sa.String(100), nullable=True),
            sa.Column("counterparty_country", sa.String(100), nullable=True),
            sa.Column("sector_type",          sa.String(200), nullable=True),
            sa.Column("instrument_type",      sa.String(50),  nullable=True),
            sa.Column("obs_value",            sa.Float,       nullable=True),
            sa.Column("raw_json",             sa.Text,        nullable=True),
            schema="staging",
        )

    # Create ecb_eurosystem_raw if not exists
    if not _table_exists("staging", "ecb_eurosystem_raw"):
        op.create_table(
            "ecb_eurosystem_raw",
            sa.Column("id",                 sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("file_load_id",       sa.Integer, sa.ForeignKey("staging.file_loads.id"), nullable=False),
            sa.Column("ref_period",         sa.String(20),  nullable=True),
            sa.Column("freq",               sa.String(10),  nullable=True),
            sa.Column("item_code",          sa.String(50),  nullable=True),
            sa.Column("item_name",          sa.String(500), nullable=True),
            sa.Column("balance_sheet_side", sa.String(20),  nullable=True),
            sa.Column("obs_value",          sa.Float,       nullable=True),
            sa.Column("raw_json",           sa.Text,        nullable=True),
            schema="staging",
        )

    # Create dimension tables if not exist
    if not _table_exists("warehouse", "dim_entity"):
        op.create_table(
            "dim_entity",
            sa.Column("id",             sa.Integer,                 primary_key=True, autoincrement=True),
            sa.Column("entity_key",     sa.String(100),             nullable=False),
            sa.Column("entity_name",    sa.String(500),             nullable=False),
            sa.Column("entity_type",    sa.String(50),              nullable=True),
            sa.Column("country_code",   sa.String(10),              nullable=True),
            sa.Column("lei",            sa.String(20),              nullable=True),
            sa.Column("bic",            sa.String(20),              nullable=True),
            sa.Column("source",         sa.String(50),              nullable=True),
            sa.Column("effective_date", sa.Date,                    nullable=True),
            sa.Column("is_current",     sa.Boolean,                 nullable=False, default=True),
            sa.Column("loaded_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
            schema="warehouse",
        )

    if not _table_exists("warehouse", "dim_period"):
        op.create_table(
            "dim_period",
            sa.Column("id",                sa.Integer,                 primary_key=True, autoincrement=True),
            sa.Column("period_key",        sa.String(20),              nullable=False, unique=True),
            sa.Column("period_start_date", sa.Date,                    nullable=True),
            sa.Column("period_end_date",   sa.Date,                    nullable=True),
            sa.Column("frequency",         sa.String(10),              nullable=True),
            sa.Column("year",              sa.Integer,                 nullable=True),
            sa.Column("quarter",           sa.Integer,                 nullable=True),
            sa.Column("month",             sa.Integer,                 nullable=True),
            sa.Column("week",              sa.Integer,                 nullable=True),
            sa.Column("loaded_at",         sa.DateTime(timezone=True), server_default=sa.func.now()),
            schema="warehouse",
        )

    if not _table_exists("warehouse", "dim_metric"):
        op.create_table(
            "dim_metric",
            sa.Column("id",                   sa.Integer,                 primary_key=True, autoincrement=True),
            sa.Column("metric_code",          sa.String(100),             nullable=False, unique=True),
            sa.Column("metric_name",          sa.String(500),             nullable=False),
            sa.Column("metric_category",      sa.String(100),             nullable=True),
            sa.Column("unit",                 sa.String(50),              nullable=True),
            sa.Column("regulatory_framework", sa.String(100),             nullable=True),
            sa.Column("minimum_threshold",    sa.Float,                   nullable=True),
            sa.Column("maximum_threshold",    sa.Float,                   nullable=True),
            sa.Column("metric_steward",       sa.String(100),             nullable=True),
            sa.Column("loaded_at",            sa.DateTime(timezone=True), server_default=sa.func.now()),
            schema="warehouse",
        )

    if not _table_exists("warehouse", "dim_source"):
        op.create_table(
            "dim_source",
            sa.Column("id",                 sa.Integer,                 primary_key=True, autoincrement=True),
            sa.Column("source_code",        sa.String(50),              nullable=False, unique=True),
            sa.Column("source_name",        sa.String(100),             nullable=False),
            sa.Column("provider",           sa.String(100),             nullable=True),
            sa.Column("frequency",          sa.String(20),              nullable=True),
            sa.Column("typical_lag_days",   sa.Integer,                 nullable=True),
            sa.Column("file_format",        sa.String(50),              nullable=True),
            sa.Column("grain",              sa.String(200),             nullable=True),
            sa.Column("coverage_scope",     sa.String(200),             nullable=True),
            sa.Column("data_quality_score", sa.Float,                   nullable=True),
            sa.Column("loaded_at",          sa.DateTime(timezone=True), server_default=sa.func.now()),
            schema="warehouse",
        )


def downgrade() -> None:
    for t in ("dim_source", "dim_metric", "dim_period", "dim_entity"):
        if _table_exists("warehouse", t):
            op.drop_table(t, schema="warehouse")
    for t in ("ecb_eurosystem_raw", "bis_lbs_raw"):
        if _table_exists("staging", t):
            op.drop_table(t, schema="staging")
