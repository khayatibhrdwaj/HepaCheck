from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.services.score_service import create_entry
from app.core.auth import require_role
from app.core.templates import templates

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.post("/score", name="patient_submit_score")
def submit_score(
    request: Request,
    age: float = Form(...),
    ast: float = Form(...),
    alt: float = Form(...),
    platelets: float = Form(...),
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("patient")),
):
    # Create DB entry
    entry = create_entry(
        db=db,
        user_id=user["id"],
        age=age,
        ast=ast,
        alt=alt,
        platelets=platelets,
    )

    # Return HTML response
    return templates.TemplateResponse(
        "patient/score.html",
        {
            "request": request,
            "entry": entry,
            "active_page": "patient_scores",
            "user": user,
        },
    )
