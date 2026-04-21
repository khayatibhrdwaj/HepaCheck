from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.core.templates import templates

router = APIRouter(tags=["common"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/", response_class=HTMLResponse, name="home")
def landing_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request, "page_title": "Welcome"}
    )