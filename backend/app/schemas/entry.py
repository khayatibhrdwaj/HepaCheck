from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# ======================================================
# INPUT SCHEMA
# ======================================================

class ScoreInput(BaseModel):
    age: Optional[float] = Field(None, description="Age in years")
    ast: Optional[float] = Field(None, description="AST (IU/L)")
    alt: Optional[float] = Field(None, description="ALT (IU/L)")
    platelets: Optional[float] = Field(None, description="Platelets (×10^9/L)")
    albumin: Optional[float] = Field(None, description="Albumin (g/dL)")
    bmi: Optional[float] = Field(None, description="Body Mass Index (kg/m²)")
    diabetes: Optional[bool] = Field(False, description="Diabetes or IFG")

    glucose: Optional[float] = Field(
        None, description="Fasting plasma glucose (mg/dL)"
    )
    insulin: Optional[float] = Field(
        None, description="Fasting serum insulin (µU/mL)"
    )


# ======================================================
# COMPUTE RESPONSE SCHEMA
# ======================================================

class ScoreOutput(BaseModel):
    fib4: float
    fib4_risk: str                 # Low / Moderate / High / Unknown
    fib4_risk_code: Optional[int]  # 0 / 1 / 2
    apri: float
    nfs: float
    homa_ir: float
    
# ======================================================
# DATABASE OUTPUT SCHEMA
# ======================================================

class EntryOut(BaseModel):
    id: int
    created_at: datetime

    age: Optional[float]
    ast: Optional[float]
    alt: Optional[float]
    platelets: Optional[float]
    albumin: Optional[float]
    bmi: Optional[float]
    diabetes: bool
    glucose: Optional[float]
    insulin: Optional[float]

    fib4: Optional[float]
    fib4_risk: Optional[int]
    apri: Optional[float]
    nfs: Optional[float]
    homa_ir: Optional[float]

    class Config:
        from_attributes = True
