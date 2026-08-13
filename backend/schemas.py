from typing import Optional

from pydantic import BaseModel, Field


class FundRecordCreate(BaseModel):
    fiscal_year: str = Field(..., min_length=4)
    department: str
    scheme_name: str
    district: Optional[str] = None
    category: Optional[str] = None
    allocation: float
    utilization: float
    variance: Optional[float] = None


class FundRecordResponse(FundRecordCreate):
    id: int


class CSVProcessingSummary(BaseModel):
    total_allocation: float
    total_utilization: float
    average_utilization_rate: float
    departments: list[str]
