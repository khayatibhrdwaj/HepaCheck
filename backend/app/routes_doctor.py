from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db, User, Entry, Flag, Notification, PatientDoctor
from app.auth import require_role

router = APIRouter(prefix="/doctor")
templates = Jinja2Templates(directory="templates")


def _get_doctor(request: Request, db: Session) -> User:
    payload = require_role(request, "doctor")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise Exception("Doctor not found")
    return user


def _get_assigned_patient_ids(doctor: User, db: Session) -> list[int]:
    """Return list of patient user IDs assigned to this doctor."""
    assignments = (
        db.query(PatientDoctor)
        .filter(PatientDoctor.doctor_id == doctor.id)
        .all()
    )
    return [a.patient_id for a in assignments]


# ── Home ──────────────────────────────────────────────────────────────────────
@router.get("/home", response_class=HTMLResponse)
async def doctor_home(request: Request, db: Session = Depends(get_db)):
    doctor = _get_doctor(request, db)
    patient_ids = _get_assigned_patient_ids(doctor, db)

    # Only patients assigned to THIS doctor
    patients = (
        db.query(User)
        .filter(User.id.in_(patient_ids))
        .all()
    ) if patient_ids else []

    # Only entries from assigned patients, newest first
    entries = (
        db.query(Entry)
        .join(User, Entry.user_id == User.id)
        .filter(Entry.user_id.in_(patient_ids))
        .order_by(Entry.created_at.desc())
        .all()
    ) if patient_ids else []

    # Emergency entries with no open flag yet
    flagged_entry_ids = {
        f.entry_id
        for f in db.query(Flag)
        .filter(Flag.status == "open", Flag.entry_id.in_([e.id for e in entries]))
        .all()
    }
    emergencies = [e for e in entries if e.is_emergency and e.id not in flagged_entry_ids]

    # Open flags raised by this doctor on assigned patients
    open_flags = (
        db.query(Flag)
        .filter(Flag.doctor_id == doctor.id, Flag.status == "open")
        .order_by(Flag.created_at.desc())
        .all()
    )

    # Unread notifications for this doctor
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == doctor.id, Notification.is_read == False)
        .order_by(Notification.created_at.desc())
        .all()
    )

    stats = {
        "total_patients":  len(patients),
        "total_entries":   len(entries),
        "open_flags":      len(open_flags),
        "emergencies":     len(emergencies),
        "notifications":   len(notifications),
    }

    return templates.TemplateResponse("doctor/home.html", {
        "request":       request,
        "user":          doctor,
        "patients":      patients,
        "entries":       entries,
        "emergencies":   emergencies,
        "open_flags":    open_flags,
        "notifications": notifications,
        "stats":         stats,
    })


# ── Flag an entry ─────────────────────────────────────────────────────────────
@router.post("/flag")
async def flag_entry(
    request:  Request,
    entry_id: int = Form(...),
    note:     str = Form(default=""),
    db: Session = Depends(get_db),
):
    doctor = _get_doctor(request, db)
    patient_ids = _get_assigned_patient_ids(doctor, db)

    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    # Guard: only flag entries belonging to assigned patients
    if not entry or entry.user_id not in patient_ids:
        return RedirectResponse("/doctor/home", status_code=303)

    flag = Flag(entry_id=entry_id, doctor_id=doctor.id, note=note, status="open")
    db.add(flag)

    notif = Notification(
        user_id=entry.user_id,
        message=(
            f"Dr. {doctor.username} has flagged your entry from "
            f"{entry.created_at.strftime('%b %d, %Y')} "
            f"(FIB-4: {entry.fib4}, APRI: {entry.apri})"
            + (f": {note}" if note else ".")
        ),
    )
    db.add(notif)
    db.commit()
    return RedirectResponse("/doctor/home", status_code=303)


# ── Resolve a flag ────────────────────────────────────────────────────────────
@router.post("/flag/{flag_id}/resolve")
async def resolve_flag(flag_id: int, request: Request, db: Session = Depends(get_db)):
    doctor = _get_doctor(request, db)
    flag = db.query(Flag).filter(Flag.id == flag_id, Flag.doctor_id == doctor.id).first()
    if flag:
        flag.status = "resolved"
        entry = db.query(Entry).filter(Entry.id == flag.entry_id).first()
        if entry:
            notif = Notification(
                user_id=entry.user_id,
                message=(
                    f"Dr. {doctor.username} has resolved the flag on your entry "
                    f"from {entry.created_at.strftime('%b %d, %Y')}."
                ),
            )
            db.add(notif)
        db.commit()
    return RedirectResponse("/doctor/home", status_code=303)


# ── Patient detail ────────────────────────────────────────────────────────────
@router.get("/patient/{patient_id}", response_class=HTMLResponse)
async def patient_detail(patient_id: int, request: Request, db: Session = Depends(get_db)):
    doctor = _get_doctor(request, db)
    patient_ids = _get_assigned_patient_ids(doctor, db)

    # Guard: can only view assigned patients
    if patient_id not in patient_ids:
        return RedirectResponse("/doctor/home", status_code=302)

    patient = db.query(User).filter(User.id == patient_id).first()
    entries = (
        db.query(Entry)
        .filter(Entry.user_id == patient_id)
        .order_by(Entry.created_at.desc())
        .all()
    )

    return templates.TemplateResponse("doctor/home.html", {
        "request":        request,
        "user":           doctor,
        "patients":       [],
        "entries":        [],
        "emergencies":    [],
        "open_flags":     [],
        "notifications":  [],
        "stats":          {"total_patients": 0, "total_entries": 0, "open_flags": 0, "emergencies": 0, "notifications": 0},
        "detail_patient": patient,
        "detail_entries": entries,
        "active_tab":     "patients",
    })


# ── Mark doctor notifications read ───────────────────────────────────────────
@router.post("/notifications/read")
async def mark_notifications_read(request: Request, db: Session = Depends(get_db)):
    doctor = _get_doctor(request, db)
    db.query(Notification).filter(
        Notification.user_id == doctor.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return RedirectResponse("/doctor/home", status_code=303)
