# backend/app/api/scores.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from math import sqrt
from typing import List, Optional

from ..core.db import get_db
from ..schemas.entry import ScoreInput, ScoreOutput, EntryOut
from ..models.entry import Entry

# 🔐 API key guard (optional – only enforces if HEPACHEK_API_KEY is set)
from ..core.auth import require_api_key

router = APIRouter(
    prefix="/scores",
    tags=["scores"],
    dependencies=[Depends(require_api_key)],
)

# ---------------------- calculators ----------------------

def fib4(age: Optional[float], ast: Optional[float],
         alt: Optional[float], platelets: Optional[float]) -> Optional[float]:
    if not all([age, ast, alt, platelets]):
        return None
    if alt <= 0 or platelets <= 0:
        return None
    try:
        return (age * ast) / (platelets * sqrt(alt))
    except ZeroDivisionError:
        return None

def apri(ast: Optional[float], platelets: Optional[float], ast_uln: float = 40.0) -> Optional[float]:
    if not all([ast, platelets]) or ast_uln <= 0 or platelets <= 0:
        return None
    return ((ast / ast_uln) / platelets) * 100.0

def nafld_fibrosis_score(age: Optional[float], bmi: Optional[float], platelets: Optional[float],
                         albumin: Optional[float], ast: Optional[float], alt: Optional[float],
                         diabetes: Optional[bool]) -> Optional[float]:
    if not all([age, bmi, platelets, albumin, ast, alt]):
        return None
    if alt == 0:
        return None
    dm = 1 if diabetes else 0
    ast_alt = ast / alt
    return -1.675 + 0.037 * age + 0.094 * bmi + 1.13 * dm + 0.99 * ast_alt - 0.013 * platelets - 0.66 * albumin

def homa_ir(glucose: Optional[float], insulin: Optional[float]) -> Optional[float]:
    if not all([glucose, insulin]):
        return None
    if glucose <= 0:
        return None
    return (glucose * insulin) / 405.0

def fib4_risk_label(score: Optional[float]) -> str:
    if score is None:
        return "Unknown"
    if score < 1.3:
        return "Low"
    if score < 2.67:
        return "Moderate"
    return "High"

def fib4_risk_code(label: str) -> Optional[int]:
    return {"Low": 0, "Moderate": 1, "High": 2}.get(label, None)

# ------------------------ routes ------------------------

@router.post("/compute", response_model=ScoreOutput)
def compute(payload: ScoreInput):
    f4 = fib4(payload.age, payload.ast, payload.alt, payload.platelets)
    apr = apri(payload.ast, payload.platelets)
    nfs = nafld_fibrosis_score(
        payload.age, payload.bmi, payload.platelets,
        payload.albumin, payload.ast, payload.alt, payload.diabetes
    )
    h = homa_ir(payload.glucose, payload.insulin)

    return {
        "fib4": round(f4, 3) if f4 is not None else 0.0,
        "fib4_risk": fib4_risk_label(f4),
        "apri": round(apr, 3) if apr is not None else 0.0,
        "nfs": round(nfs, 3) if nfs is not None else 0.0,
        "homa_ir": round(h, 3) if h is not None else 0.0,
    }

@router.post("/save", response_model=EntryOut)
def save(payload: ScoreInput, db: Session = Depends(get_db)):
    f4 = fib4(payload.age, payload.ast, payload.alt, payload.platelets)
    label = fib4_risk_label(f4)

    entity = Entry(
        age=payload.age, ast=payload.ast, alt=payload.alt,
        platelets=payload.platelets, albumin=payload.albumin,
        bmi=payload.bmi, diabetes=bool(payload.diabetes),
        glucose=payload.glucose, insulin=payload.insulin,
        fib4=f4, fib4_risk=fib4_risk_code(label),
        apri=apri(payload.ast, payload.platelets),
        nfs=nafld_fibrosis_score(
            payload.age, payload.bmi, payload.platelets,
            payload.albumin, payload.ast, payload.alt, payload.diabetes
        ),
        homa_ir=homa_ir(payload.glucose, payload.insulin),
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

@router.get("/history", response_model=List[EntryOut])
def history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(Entry).order_by(Entry.created_at.desc()).limit(limit).all()
    return rows

# --- delete a single entry ---
@router.delete("/delete/{entry_id}", response_model=EntryOut)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    row = db.query(Entry).filter(Entry.id == entry_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(row)
    db.commit()
    return row

# --- clear all history ---
@router.delete("/clear")
def clear_history(db: Session = Depends(get_db)):
    deleted = db.query(Entry).delete()
    db.commit()
    return {"deleted": deleted}
