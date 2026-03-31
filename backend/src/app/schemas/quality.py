"""
Pydantic schemas for the /api/v1/quality endpoint.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RuleResultRow(BaseModel):
    """Result of one validation rule for the most recent pipeline run."""
    rule_code: str         # e.g. 'DQ-001'
    rule_name: str
    severity: str          # 'Critical' | 'High' | 'Medium' | 'Low'
    records_checked: int
    records_passed: int
    records_failed: int
    pass_rate: float       # percentage, e.g. 99.6
    run_at: Optional[datetime] = None


class QualityResponse(BaseModel):
    overall_score: float   # weighted pass rate across all rules (%)
    total_failed: int      # total failed records across all rules
    rules_evaluated: int
    results: list[RuleResultRow] = []
