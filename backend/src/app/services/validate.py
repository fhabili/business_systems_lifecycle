"""
Validation service — fires business rules against the Warehouse layer.

Rules are defined in validation.rule_definitions (seeded once by seed_rules()).
Results are written to validation.rule_results per pipeline run.

A failed rule NEVER silently discards data. It logs the failure so analysts
can investigate. This is the difference between a production system and a script.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.validation import RuleDefinition


# Default rule catalogue — these are seeded into the database once on first run.
# A business analyst (you) owns this list: add, remove, or change severity here.
DEFAULT_RULES = [
    {
        "rule_code": "DQ-001",
        "rule_name": "Missing Bank Identifier",
        "severity": "Critical",
        "description": "bank_id is NULL or empty. Cannot attribute the position to any institution.",
    },
    {
        "rule_code": "DQ-002",
        "rule_name": "LCR Ratio Below Regulatory Minimum (100%)",
        "severity": "Critical",
        "description": "lcr_ratio < 100. Bank is in breach of Basel III CRR2 Article 412.",
    },
    {
        "rule_code": "DQ-003",
        "rule_name": "NSFR Ratio Below Regulatory Minimum (100%)",
        "severity": "Critical",
        "description": "nsfr_ratio < 100. Bank is in breach of Basel III CRR2 Article 428b.",
    },
    {
        "rule_code": "DQ-004",
        "rule_name": "LCR Month-on-Month Swing > 5%",
        "severity": "High",
        "description": "Absolute change in LCR ratio exceeds 5 percentage points vs prior period. Flags rapid deterioration.",
    },
    {
        "rule_code": "DQ-005",
        "rule_name": "Missing Reference Date",
        "severity": "High",
        "description": "reference_date is NULL. Cannot assign the position to a reporting period.",
    },
    {
        "rule_code": "DQ-006",
        "rule_name": "Negative HQLA Amount",
        "severity": "Critical",
        "description": "hqla_amount < 0. Physically implausible. Indicates a data load error.",
    },
    {
        "rule_code": "DQ-007",
        "rule_name": "Missing Country Code",
        "severity": "Medium",
        "description": "country is NULL. Position cannot be attributed to a jurisdiction.",
    },
    {
        "rule_code": "DQ-008",
        "rule_name": "NSFR Ratio Implausibly High (>300%)",
        "severity": "Medium",
        "description": "nsfr_ratio > 300. Likely a unit error or data mapping mistake.",
    },
]


async def seed_rules(db: AsyncSession) -> int:
    """
    Insert default rule definitions into validation.rule_definitions.
    Skips rules that already exist (idempotent — safe to call on every startup).
    Returns the number of rules inserted.
    """
    inserted = 0
    for rule_data in DEFAULT_RULES:
        existing = await db.execute(
            select(RuleDefinition).where(RuleDefinition.rule_code == rule_data["rule_code"])
        )
        if existing.scalar_one_or_none() is None:
            rule = RuleDefinition(**rule_data)
            db.add(rule)
            inserted += 1
    await db.commit()
    return inserted


async def run_all_rules(run_id: int, db: AsyncSession) -> dict:
    """
    Fire all active rules against the warehouse data for this pipeline run.
    Write one RuleResult row per rule to validation.rule_results.

    Returns a summary dict: {total_checked, total_passed, total_failed}
    """
    # TODO: implement rule execution logic once warehouse tables have real data.
    # Pattern for each rule:
    #   1. Query warehouse.bank_lcr / bank_nsfr for validation
    #   2. Count rows_checked, rows_passed, rows_failed
    #   3. Write RuleResult(run_id=run_id, rule_id=rule.id, ...)
    raise NotImplementedError(
        "run_all_rules: implement after warehouse data is loaded and column types confirmed."
    )
