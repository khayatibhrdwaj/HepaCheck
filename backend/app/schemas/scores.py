
from pydantic import BaseModel, confloat

class ScoreInput(BaseModel):
    age: confloat(gt=0)
    ast: confloat(gt=0)
    alt: confloat(gt=0)
    platelets: confloat(gt=0)
    albumin: confloat(gt=0) | None = None
    bmi: confloat(gt=0) | None = None
    diabetes: bool | None = None
    glucose: confloat(gt=0) | None = None
    insulin: confloat(gt=0) | None = None

class ScoreOutput(BaseModel):
    fib4: float | None = None
    fib4_risk: str | None = None
    apri: float | None = None
    nfs: float | None = None
    homa_ir: float | None = None
