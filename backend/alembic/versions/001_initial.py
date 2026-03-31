"""create four schemas and all tables

Revision ID: 001_initial
Revises:
Create Date: 2026-03-31

Creation order respects foreign key dependencies:
  staging.file_loads          (no FK)
  staging.ecb_sup_raw         (FK → staging.file_loads)
  staging.eba_raw             (FK → staging.file_loads)
  staging.bista_raw           (FK → staging.file_loads)
  lineage.pipeline_runs       (no FK) ← must exist before validation.rule_results
  lineage.layer_events        (FK → lineage.pipeline_runs)
  warehouse.bank_lcr          (no FK)
  warehouse.bank_nsfr         (no FK)
  warehouse.supervisory_series (no FK)
  validation.rule_definitions (no FK)
  validation.rule_results     (FK → lineage.pipeline_runs, validation.rule_definitions)
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Create the four schemas ────────────────────────────────────────────────
    op.execute("CREATE SCHEMA IF NOT EXISTS staging")
    op.execute("CREATE SCHEMA IF NOT EXISTS warehouse")
    op.execute("CREATE SCHEMA IF NOT EXISTS lineage")
    op.execute("CREATE SCHEMA IF NOT EXISTS validation")

    # ── staging ────────────────────────────────────────────────────────────────

    op.create_table(
        "file_loads",
        sa.Column("id",            sa.Integer,               primary_key=True, autoincrement=True),
        sa.Column("filename",      sa.String(255),            nullable=False),
        sa.Column("source",        sa.String(50),             nullable=False),
        sa.Column("loaded_at",     sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("row_count",     sa.Integer,                nullable=True),
        sa.Column("status",        sa.String(20),             nullable=False, default="loaded"),
        sa.Column("error_message", sa.Text,                   nullable=True),
        schema="staging",
    )

    op.create_table(
        "ecb_sup_raw",
        sa.Column("id",           sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("file_load_id", sa.Integer, sa.ForeignKey("staging.file_loads.id"), nullable=False),
        sa.Column("series_key",   sa.String(500),             nullable=True),
        sa.Column("ref_area",     sa.String(10),              nullable=True),
        sa.Column("freq",         sa.String(10),              nullable=True),
        sa.Column("ref_period",   sa.String(20),              nullable=True),
        sa.Column("obs_value",    sa.Float,                   nullable=True),
        sa.Column("raw_json",     sa.Text,                    nullable=True),
        schema="staging",
    )

    op.create_table(
        "eba_raw",
        sa.Column("id",             sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("file_load_id",   sa.Integer, sa.ForeignKey("staging.file_loads.id"), nullable=False),
        sa.Column("bank_id",        sa.String(100),  nullable=True),
        sa.Column("bank_name",      sa.String(255),  nullable=True),
        sa.Column("country",        sa.String(10),   nullable=True),
        sa.Column("reference_date", sa.String(20),   nullable=True),
        sa.Column("metric_code",    sa.String(200),  nullable=True),
        sa.Column("metric_value",   sa.Float,        nullable=True),
        sa.Column("raw_json",       sa.Text,         nullable=True),
        schema="staging",
    )

    op.create_table(
        "bista_raw",
        sa.Column("id",           sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("file_load_id", sa.Integer, sa.ForeignKey("staging.file_loads.id"), nullable=False),
        sa.Column("ref_period",   sa.String(20),  nullable=True),
        sa.Column("series_key",   sa.String(500), nullable=True),
        sa.Column("obs_value",    sa.Float,       nullable=True),
        sa.Column("raw_json",     sa.Text,        nullable=True),
        schema="staging",
    )

    # ── lineage (before validation — rule_results has FK here) ─────────────────

    op.create_table(
        "pipeline_runs",
        sa.Column("id",          sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("started_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status",      sa.String(20),             nullable=False, default="running"),
        sa.Column("trigger",     sa.String(50),             nullable=True),
        sa.Column("notes",       sa.Text,                   nullable=True),
        schema="lineage",
    )

    op.create_table(
        "layer_events",
        sa.Column("id",            sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("run_id",        sa.Integer, sa.ForeignKey("lineage.pipeline_runs.id"), nullable=False),
        sa.Column("layer",         sa.String(20),             nullable=False),
        sa.Column("source_name",   sa.String(50),             nullable=True),
        sa.Column("started_at",    sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("finished_at",   sa.DateTime(timezone=True), nullable=True),
        sa.Column("rows_in",       sa.Integer,                nullable=True),
        sa.Column("rows_out",      sa.Integer,                nullable=True),
        sa.Column("status",        sa.String(20),             nullable=False, default="success"),
        sa.Column("error_message", sa.Text,                   nullable=True),
        schema="lineage",
    )

    # ── warehouse ──────────────────────────────────────────────────────────────

    op.create_table(
        "bank_lcr",
        sa.Column("id",             sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("bank_id",        sa.String(100),            nullable=False),
        sa.Column("bank_name",      sa.String(255),            nullable=True),
        sa.Column("country",        sa.String(10),             nullable=True),
        sa.Column("reference_date", sa.Date,                   nullable=True),
        sa.Column("hqla_amount",    sa.Float,                  nullable=True),
        sa.Column("net_outflow",    sa.Float,                  nullable=True),
        sa.Column("lcr_ratio",      sa.Float,                  nullable=True),
        sa.Column("source",         sa.String(20),             nullable=True),
        sa.Column("loaded_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
        schema="warehouse",
    )

    op.create_table(
        "bank_nsfr",
        sa.Column("id",             sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("bank_id",        sa.String(100),            nullable=False),
        sa.Column("bank_name",      sa.String(255),            nullable=True),
        sa.Column("country",        sa.String(10),             nullable=True),
        sa.Column("reference_date", sa.Date,                   nullable=True),
        sa.Column("asf_amount",     sa.Float,                  nullable=True),
        sa.Column("rsf_amount",     sa.Float,                  nullable=True),
        sa.Column("nsfr_ratio",     sa.Float,                  nullable=True),
        sa.Column("source",         sa.String(20),             nullable=True),
        sa.Column("loaded_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
        schema="warehouse",
    )

    op.create_table(
        "supervisory_series",
        sa.Column("id",          sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("series_key",  sa.String(500),            nullable=True),
        sa.Column("ref_area",    sa.String(10),             nullable=True),
        sa.Column("freq",        sa.String(10),             nullable=True),
        sa.Column("ref_period",  sa.String(20),             nullable=True),
        sa.Column("period_date", sa.Date,                   nullable=True),
        sa.Column("metric_name", sa.String(255),            nullable=True),
        sa.Column("obs_value",   sa.Float,                  nullable=True),
        sa.Column("loaded_at",   sa.DateTime(timezone=True), server_default=sa.func.now()),
        schema="warehouse",
    )

    # ── validation ─────────────────────────────────────────────────────────────

    op.create_table(
        "rule_definitions",
        sa.Column("id",          sa.Integer,    primary_key=True, autoincrement=True),
        sa.Column("rule_code",   sa.String(20), nullable=False, unique=True),
        sa.Column("rule_name",   sa.String(255), nullable=False),
        sa.Column("severity",    sa.String(20), nullable=False),
        sa.Column("description", sa.Text,       nullable=True),
        sa.Column("active",      sa.Boolean,    nullable=False, default=True),
        schema="validation",
    )

    op.create_table(
        "rule_results",
        sa.Column("id",              sa.Integer,                primary_key=True, autoincrement=True),
        sa.Column("run_id",          sa.Integer, sa.ForeignKey("lineage.pipeline_runs.id"),       nullable=False),
        sa.Column("rule_id",         sa.Integer, sa.ForeignKey("validation.rule_definitions.id"), nullable=False),
        sa.Column("records_checked", sa.Integer, nullable=False, default=0),
        sa.Column("records_passed",  sa.Integer, nullable=False, default=0),
        sa.Column("records_failed",  sa.Integer, nullable=False, default=0),
        sa.Column("run_at",          sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("sample_failures", sa.Text,    nullable=True),
        schema="validation",
    )


def downgrade() -> None:
    # Drop in reverse FK order
    op.drop_table("rule_results",        schema="validation")
    op.drop_table("rule_definitions",    schema="validation")
    op.drop_table("supervisory_series",  schema="warehouse")
    op.drop_table("bank_nsfr",           schema="warehouse")
    op.drop_table("bank_lcr",            schema="warehouse")
    op.drop_table("layer_events",        schema="lineage")
    op.drop_table("pipeline_runs",       schema="lineage")
    op.drop_table("bista_raw",           schema="staging")
    op.drop_table("eba_raw",             schema="staging")
    op.drop_table("ecb_sup_raw",         schema="staging")
    op.drop_table("file_loads",          schema="staging")
    op.execute("DROP SCHEMA IF EXISTS validation")
    op.execute("DROP SCHEMA IF EXISTS warehouse")
    op.execute("DROP SCHEMA IF EXISTS lineage")
    op.execute("DROP SCHEMA IF EXISTS staging")
