import os
from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

from app.database import get_db, User, DoctorProfile

router = APIRouter()

# backend/app/routes_auth.py  →  go up two levels to backend/  →  then templates/
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.dirname(_HERE)
templates = Jinja2Templates(directory=os.path.join(_BACKEND, "templates"))

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.environ.get("SECRET_KEY", "hepacheck-dev-secret-change-in-prod")
ALGORITHM  = "HS256"
TOKEN_TTL  = 60 * 24  # minutes


def create_token(user_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_TTL)
    return jwt.encode(
        {"sub": str(user_id), "role": role, "exp": expire},
        SECRET_KEY, ALGORITHM
    )


# ── GET /login ────────────────────────────────────────────────────────────────
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    token = request.cookies.get("access_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            role = payload.get("role")
            if role in ("patient", "doctor"):
                return RedirectResponse(f"/{role}/home", status_code=302)
        except JWTError:
            pass
    return templates.TemplateResponse("login.html", {"request": request})


# ── POST /login ───────────────────────────────────────────────────────────────
@router.post("/login", response_class=HTMLResponse)
async def login(
    request:  Request,
    email:    str = Form(...),
    password: str = Form(...),
    role:     str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == email.strip().lower()).first()

    if not user or not pwd_ctx.verify(password, user.password):
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid email or password.",
        })

    if user.role != role:
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": (
                f"This account is registered as a {user.role}. "
                f"Please select \"{user.role.capitalize()}\" to continue."
            ),
        })

    token = create_token(user.id, user.role)
    response = RedirectResponse(f"/{user.role}/home", status_code=303)
    response.set_cookie("access_token", token, httponly=True, max_age=TOKEN_TTL * 60)
    return response


# ── GET /register ─────────────────────────────────────────────────────────────
@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# ── POST /register/patient ────────────────────────────────────────────────────
@router.post("/register/patient", response_class=HTMLResponse)
async def register_patient(
    request:  Request,
    username: str = Form(...),
    email:    str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    email = email.strip().lower()

    if db.query(User).filter(User.email == email).first():
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "An account with this email already exists.",
            "prefill": {"username": username, "email": email, "role": "patient"},
        })

    if len(password) < 6:
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "Password must be at least 6 characters.",
            "prefill": {"username": username, "email": email, "role": "patient"},
        })

    hashed = pwd_ctx.hash(password)
    user = User(username=username.strip(), email=email, password=hashed, role="patient")
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id, "patient")
    response = RedirectResponse("/patient/home", status_code=303)
    response.set_cookie("access_token", token, httponly=True, max_age=TOKEN_TTL * 60)
    return response


# ── POST /register/doctor ─────────────────────────────────────────────────────
@router.post("/register/doctor", response_class=HTMLResponse)
async def register_doctor(
    request:          Request,
    username:         str = Form(...),
    email:            str = Form(...),
    password:         str = Form(...),
    medical_licence:  str = Form(...),
    highest_degree:   str = Form(...),
    specialisation:   str = Form(...),
    years_practicing: str = Form(...),
    clinic_hospital:  str = Form(default=""),
    city:             str = Form(default=""),
    bio:              str = Form(default=""),
    db: Session = Depends(get_db),
):
    email = email.strip().lower()

    prefill = {
        "username": username, "email": email, "role": "doctor",
        "medical_licence": medical_licence, "highest_degree": highest_degree,
        "specialisation": specialisation, "years_practicing": years_practicing,
        "clinic_hospital": clinic_hospital, "city": city, "bio": bio,
    }

    if db.query(User).filter(User.email == email).first():
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "An account with this email already exists.",
            "prefill": prefill,
        })

    missing = []
    if not medical_licence.strip():       missing.append("Medical licence number")
    if not highest_degree.strip():        missing.append("Highest degree")
    if not specialisation.strip():        missing.append("Specialisation")
    if not years_practicing.strip() or years_practicing == "0":
        missing.append("Years practicing")
    if len(password) < 6:                 missing.append("Password (min 6 characters)")

    if missing:
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "Please fill in: " + ", ".join(missing) + ".",
            "prefill": prefill,
        })

    hashed = pwd_ctx.hash(password)
    user = User(username=username.strip(), email=email, password=hashed, role="doctor")
    db.add(user)
    db.flush()

    profile = DoctorProfile(
        user_id          = user.id,
        medical_licence  = medical_licence.strip(),
        highest_degree   = highest_degree.strip(),
        specialisation   = specialisation.strip(),
        years_practicing = int(years_practicing or 0),
        clinic_hospital  = clinic_hospital.strip(),
        city             = city.strip(),
        bio              = bio.strip(),
        is_verified      = False,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_token(user.id, "doctor")
    response = RedirectResponse("/doctor/home", status_code=303)
    response.set_cookie("access_token", token, httponly=True, max_age=TOKEN_TTL * 60)
    return response


# ── GET /logout ───────────────────────────────────────────────────────────────
@router.get("/logout")
async def logout():
    """Always deletes the cookie and hard-redirects to /login."""
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("access_token")
    return response