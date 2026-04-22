from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import (
    get_db, User, Entry, Flag, Notification,
    DoctorProfile, PatientDoctor,
    CommunityPost, PostReply, PostLike,
)
from app.auth import require_role

router = APIRouter(prefix="/patient")
templates = Jinja2Templates(directory="templates")


def _get_patient(request: Request, db: Session) -> User:
    payload = require_role(request, "patient")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise Exception("Patient not found")
    return user


# ── Home ──────────────────────────────────────────────────────────────────────
@router.get("/home", response_class=HTMLResponse)
async def patient_home(request: Request, db: Session = Depends(get_db)):
    patient = _get_patient(request, db)

    entries = (
        db.query(Entry)
        .filter(Entry.user_id == patient.id)
        .order_by(Entry.created_at.desc())
        .all()
    )

    unread_notifications = (
        db.query(Notification)
        .filter(Notification.user_id == patient.id, Notification.is_read == False)
        .order_by(Notification.created_at.desc())
        .all()
    )

    assignment = (
        db.query(PatientDoctor)
        .filter(PatientDoctor.patient_id == patient.id)
        .first()
    )
    assigned_doctor = None
    if assignment:
        assigned_doctor = db.query(User).filter(User.id == assignment.doctor_id).first()

    return templates.TemplateResponse("patient/home.html", {
        "request":         request,
        "user":            patient,
        "entries":         entries,
        "notifications":   unread_notifications,
        "assigned_doctor": assigned_doctor,
        "assignment":      assignment,
    })


# ── Score entry ───────────────────────────────────────────────────────────────
@router.post("/score")
async def save_score(
    request:   Request,
    age:       float = Form(...),
    ast:       float = Form(...),
    alt:       float = Form(...),
    platelets: float = Form(...),
    albumin:   float = Form(...),
    bmi:       float = Form(...),
    diabetes:  bool  = Form(default=False),
    glucose:   float = Form(...),
    insulin:   float = Form(...),
    db: Session = Depends(get_db),
):
    patient = _get_patient(request, db)

    import math
    fib4    = (age * ast) / (platelets * math.sqrt(alt)) if platelets > 0 and alt > 0 else 0.0
    apri    = (ast / 40 * 100) / platelets if platelets > 0 else 0.0
    nfs     = (-1.675 + 0.037 * age + 0.094 * bmi + 1.13 * (1 if diabetes else 0)
               + 0.99 * (ast / alt) - 0.013 * platelets - 0.66 * albumin) if alt > 0 else 0.0
    homa_ir = (glucose * insulin) / 405 if glucose and insulin else 0.0

    if fib4 < 1.30:   risk = "Low"
    elif fib4 < 2.67: risk = "Moderate"
    else:             risk = "High"

    is_emergency = fib4 >= 2.67

    entry = Entry(
        user_id=patient.id, age=age, ast=ast, alt=alt, platelets=platelets,
        albumin=albumin, bmi=bmi, diabetes=diabetes, glucose=glucose, insulin=insulin,
        fib4=round(fib4, 4), apri=round(apri, 4), nfs=round(nfs, 4),
        homa_ir=round(homa_ir, 4), risk_level=risk, is_emergency=is_emergency,
    )
    db.add(entry)

    if is_emergency:
        assignment = db.query(PatientDoctor).filter(PatientDoctor.patient_id == patient.id).first()
        if assignment:
            notif = Notification(
                user_id=assignment.doctor_id,
                message=(
                    f"⚠️ High-risk entry from {patient.username}: "
                    f"FIB-4={round(fib4,2)}, APRI={round(apri,3)}, NFS={round(nfs,3)}."
                ),
            )
            db.add(notif)

    db.commit()
    return RedirectResponse("/patient/home", status_code=303)


# ── Choose / change doctor ────────────────────────────────────────────────────
@router.get("/choose-doctor", response_class=HTMLResponse)
async def choose_doctor_page(request: Request, db: Session = Depends(get_db)):
    patient = _get_patient(request, db)

    doctors = (
        db.query(User)
        .join(DoctorProfile, User.id == DoctorProfile.user_id)
        .filter(User.role == "doctor")
        .all()
    )

    assignment = (
        db.query(PatientDoctor)
        .filter(PatientDoctor.patient_id == patient.id)
        .first()
    )

    return templates.TemplateResponse("patient/choose_doctor.html", {
        "request":    request,
        "user":       patient,
        "doctors":    doctors,
        "assignment": assignment,
    })


@router.post("/choose-doctor")
async def choose_doctor(
    request:   Request,
    doctor_id: int = Form(...),
    db: Session = Depends(get_db),
):
    patient = _get_patient(request, db)

    doctor = db.query(User).filter(User.id == doctor_id, User.role == "doctor").first()
    if not doctor:
        return RedirectResponse("/patient/choose-doctor", status_code=303)

    assignment = (
        db.query(PatientDoctor)
        .filter(PatientDoctor.patient_id == patient.id)
        .first()
    )
    if assignment:
        old_doctor_id = assignment.doctor_id
        assignment.doctor_id = doctor_id
        if old_doctor_id != doctor_id:
            db.add(Notification(
                user_id=old_doctor_id,
                message=f"Patient {patient.username} has switched to a different doctor.",
            ))
    else:
        assignment = PatientDoctor(patient_id=patient.id, doctor_id=doctor_id)
        db.add(assignment)

    db.add(Notification(
        user_id=doctor_id,
        message=f"Patient {patient.username} has chosen you as their doctor.",
    ))
    db.commit()
    return RedirectResponse("/patient/home", status_code=303)


@router.post("/remove-doctor")
async def remove_doctor(request: Request, db: Session = Depends(get_db)):
    patient = _get_patient(request, db)
    assignment = (
        db.query(PatientDoctor)
        .filter(PatientDoctor.patient_id == patient.id)
        .first()
    )
    if assignment:
        db.add(Notification(
            user_id=assignment.doctor_id,
            message=f"Patient {patient.username} has removed you as their doctor.",
        ))
        db.delete(assignment)
        db.commit()
    return RedirectResponse("/patient/home", status_code=303)


# ── Mark notifications read ───────────────────────────────────────────────────
@router.post("/notifications/read")
async def mark_notifications_read(request: Request, db: Session = Depends(get_db)):
    patient = _get_patient(request, db)
    db.query(Notification).filter(
        Notification.user_id == patient.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return RedirectResponse("/patient/home", status_code=303)


# ════════════════════════════════════════════════════════════════════════════
#  COMMUNITY  — server-backed, real accounts only, one like per user per post
# ════════════════════════════════════════════════════════════════════════════

@router.post("/community/post")
async def community_create_post(
    request: Request,
    body:    str = Form(...),
    tag:     str = Form(default="Question"),
    db: Session = Depends(get_db),
):
    """Create a new post. Only authenticated patients can post."""
    patient = _get_patient(request, db)
    if not body.strip():
        return RedirectResponse("/patient/home#community", status_code=303)

    post = CommunityPost(author_id=patient.id, tag=tag.strip(), body=body.strip())
    db.add(post)
    db.commit()
    return RedirectResponse("/patient/home#community", status_code=303)


@router.post("/community/reply")
async def community_reply(
    request: Request,
    post_id: int = Form(...),
    body:    str = Form(...),
    db: Session = Depends(get_db),
):
    """Reply to an existing post."""
    patient = _get_patient(request, db)
    if not body.strip():
        return RedirectResponse("/patient/home#community", status_code=303)

    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if post:
        reply = PostReply(post_id=post_id, author_id=patient.id, body=body.strip())
        db.add(reply)
        db.commit()
    return RedirectResponse("/patient/home#community", status_code=303)


@router.post("/community/like/{post_id}")
async def community_like(post_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Toggle like for the current user on a post.
    The DB UniqueConstraint (post_id, user_id) enforces one-like-per-user.
    If already liked → unlike. If not liked → like.
    """
    patient = _get_patient(request, db)

    existing = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == patient.id,
    ).first()

    if existing:
        db.delete(existing)   # toggle off
        db.commit()
    else:
        try:
            db.add(PostLike(post_id=post_id, user_id=patient.id))
            db.commit()
        except IntegrityError:
            db.rollback()     # race-condition safeguard

    return RedirectResponse("/patient/home#community", status_code=303)


@router.get("/community/posts")
async def community_posts_json(request: Request, db: Session = Depends(get_db)):
    """
    Return all posts as JSON for the client-side renderer.
    Only posts from real, active users are returned.
    """
    patient = _get_patient(request, db)

    posts = (
        db.query(CommunityPost)
        .order_by(CommunityPost.created_at.desc())
        .all()
    )

    # Build liked-set for current user
    liked_ids = {
        like.post_id
        for like in db.query(PostLike).filter(PostLike.user_id == patient.id).all()
    }

    result = []
    for p in posts:
        result.append({
            "id":        p.id,
            "author":    p.author.username,
            "tag":       p.tag,
            "body":      p.body,
            "time":      p.created_at.strftime("%d %b %Y, %H:%M"),
            "likes":     len(p.likes),
            "liked":     p.id in liked_ids,
            "isOwn":     p.author_id == patient.id,
            "replies": [
                {
                    "author": r.author.username,
                    "body":   r.body,
                    "time":   r.created_at.strftime("%d %b %Y, %H:%M"),
                }
                for r in p.replies
            ],
        })

    from fastapi.responses import JSONResponse
    return JSONResponse(result)