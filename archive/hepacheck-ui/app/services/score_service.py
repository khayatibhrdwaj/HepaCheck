import math
from sqlalchemy.orm import Session

from app.models.entry import Entry
from app.services.notification_service import create_notification


# ======================
# CALCULATIONS
# ======================

def calculate_fib4(age: float, ast: float, alt: float, platelets: float) -> float:
    if alt <= 0 or platelets <= 0:
        return 0.0
    return round((age * ast) / (platelets * math.sqrt(alt)), 2)


def calculate_apri(ast: float, platelets: float) -> float:
    if platelets <= 0:
        return 0.0
    return round(((ast / 40) / platelets) * 100, 2)


def classify_risk(fib4: float) -> str:
    if fib4 < 1.45:
        return "low"
    elif fib4 <= 3.25:
        return "intermediate"
    return "high"


def is_emergency_case(fib4: float, apri: float) -> bool:
    return fib4 > 3.25 or apri > 1.5


# ======================
# CORE SERVICE
# ======================

def create_entry(
    db: Session,
    user_id: int,
    age: float,
    ast: float,
    alt: float,
    platelets: float,
):
    # Compute scores
    fib4 = calculate_fib4(age, ast, alt, platelets)
    apri = calculate_apri(ast, platelets)

    risk = classify_risk(fib4)
    emergency = is_emergency_case(fib4, apri)

    # Create DB record
    entry = Entry(
        user_id=user_id,
        fib4=fib4,
        apri=apri,
        risk_level=risk,
        is_emergency=emergency,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Trigger notification if needed
    if emergency:
        create_notification(db, user_id, "⚠️ High risk detected")

    return entry


# ======================
# DOCTOR DASHBOARD
# ======================

def get_doctor_dashboard(db: Session, limit: int = 20):
    return (
        db.query(Entry)
        .order_by(Entry.created_at.desc())
        .limit(limit)
        .all()
    )
