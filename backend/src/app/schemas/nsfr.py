"""
Pydantic schemas for the /api/v1/nsfr endpoint.
"""
from datetime import date
from typing import Optional
from pydantic import BaseModel


class BankNsfrRow(BaseModel):
    """One bank's NSFR position for one reporting date."""
    bank_id: str
    bank_name: Optional[str] = None
    country: Optional[str] = None
    reference_date: Optional[date] = None
    asf_amount: Optional[float] = None     # Available Stable Funding, EUR millions
    rsf_amount: Optional[float] = None     # Required Stable Funding, EUR millions
    nsfr_ratio: Optional[float] = None     # percentage

    model_config = {"from_attributes": True}


class NsfrResponse(BaseModel):
    banks: list[BankNsfrRow] = []
    avg_nsfr: Optional[float] = None
    min_nsfr: Optional[float] = None
    max_nsfr: Optional[float] = None
