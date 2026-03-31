"""
Pydantic schemas for the /api/v1/lcr endpoint.
"""
from datetime import date
from typing import Optional
from pydantic import BaseModel


class BankLcrRow(BaseModel):
    """One bank's LCR position for one reporting date."""
    bank_id: str
    bank_name: Optional[str] = None
    country: Optional[str] = None
    reference_date: Optional[date] = None
    hqla_amount: Optional[float] = None    # EUR millions
    net_outflow: Optional[float] = None    # EUR millions
    lcr_ratio: Optional[float] = None      # percentage

    model_config = {"from_attributes": True}


class LcrResponse(BaseModel):
    banks: list[BankLcrRow] = []
    avg_lcr: Optional[float] = None        # simple average across all banks in the response
    min_lcr: Optional[float] = None        # lowest ratio (breach risk indicator)
    max_lcr: Optional[float] = None
