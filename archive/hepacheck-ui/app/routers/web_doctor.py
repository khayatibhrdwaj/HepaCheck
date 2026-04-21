from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.core.auth import require_role
from app.services.score_service import get_doctor_dashboard
from app.core.db import get_db
from app.core.templates import templates

router = APIRouter(prefix="/doctor")
templates = Jinja2Templates(directory="app/templates")


@router.get("/home", response_class=HTMLResponse)
def doctor_home(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor"))
):
    dashboard = get_doctor_dashboard(db)

    return templates.TemplateResponse(
        "doctor/home.html",
        {
            "request": request,
            "dashboard": dashboard,
            "active_page": "doctor_home",
            "user": user
        }
    )