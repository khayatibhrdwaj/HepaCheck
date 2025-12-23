from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ScoreInput(BaseModel):
    age: Optional[float] = None
    ast: Optional[float] = None
    alt: Optional[float] = None
    platelets: Optional[float] = None
    albumin: Optional[float] = None
    bmi: Optional[float] = None
    diabetes: Optional[bool] = False
    glucose: Optional[float] = None
    insulin: Optional[float] = None

class ScoreOutput(BaseModel):
    fib4: float
    fib4_risk: str
    apri: float
    nfs: float
    homa_ir: float

class EntryOut(BaseModel):
    id: int
    created_at: datetime
    fib4: Optional[float] = None
    fib4_risk: Optional[int] = None
    apri: Optional[float] = None
    nfs: Optional[float] = None
    homa_ir: Optional[float] = None

    class Config:
        from_attributes = True
