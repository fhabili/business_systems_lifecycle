from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.validation import RuleDefinition, RuleResult
from app.schemas.quality import QualityResponse, RuleResultRow

router = APIRouter()


@router.get("/quality", response_model=QualityResponse)
async def get_quality(db: AsyncSession = Depends(get_db)):
    """
    Data Quality — validation rule results from the most recent pipeline run.
    Shows every active rule: how many records were checked, how many passed/failed.
    This is the layer that makes the pipeline trustworthy — failures are never hidden.
    """
    rules_res = await db.execute(
        select(RuleDefinition).where(RuleDefinition.active == True).order_by(RuleDefinition.rule_code)
    )
    rules = rules_res.scalars().all()

    if not rules:
        return QualityResponse(overall_score=100.0, total_failed=0, rules_evaluated=0, results=[])

    rows: list[RuleResultRow] = []
    total_failed = 0
    total_checked = 0

    for rule in rules:
        latest_res = await db.execute(
            select(RuleResult)
            .where(RuleResult.rule_id == rule.id)
            .order_by(RuleResult.run_at.desc())
            .limit(1)
        )
        latest = latest_res.scalar_one_or_none()

        if latest:
            pass_rate = (latest.records_passed / latest.records_checked * 100) if latest.records_checked else 100.0
            rows.append(RuleResultRow(
                rule_code=rule.rule_code,
                rule_name=rule.rule_name,
                severity=rule.severity,
                records_checked=latest.records_checked,
                records_passed=latest.records_passed,
                records_failed=latest.records_failed,
                pass_rate=round(pass_rate, 1),
                run_at=latest.run_at,
            ))
            total_failed += latest.records_failed
            total_checked = max(total_checked, latest.records_checked)
        else:
            # Rule exists but has never been run yet
            rows.append(RuleResultRow(
                rule_code=rule.rule_code,
                rule_name=rule.rule_name,
                severity=rule.severity,
                records_checked=0,
                records_passed=0,
                records_failed=0,
                pass_rate=100.0,
                run_at=None,
            ))

    overall = ((total_checked - total_failed) / total_checked * 100) if total_checked else 100.0

    return QualityResponse(
        overall_score=round(overall, 1),
        total_failed=total_failed,
        rules_evaluated=len(rules),
        results=rows,
    )
