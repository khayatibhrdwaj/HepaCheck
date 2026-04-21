from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.auth_service import authenticate
from app.services.user_service import create_user
from fastapi.templating import Jinja2Templates
from app.core.templates import templates
router = APIRouter()


@router.get("/")
def login_page(request: Request):
    return templates.TemplateResponse("auth/login.html", {"request": request})


@router.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = authenticate(db, username, password)

    if not user:
        return RedirectResponse("/", status_code=303)

    request.session["user"] = {"id": user.id, "role": user.role}

    return RedirectResponse(f"/{user.role}/home", status_code=303)