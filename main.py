import os

# ── Force working directory to backend/ so relative imports are consistent ──
# This is critical on Render where CWD may not be the backend folder.
_HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(_HERE)

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.responses import JSONResponse

from app.database import init_db
from app.routes_auth import router as auth_router
from app.routes_patient import router as patient_router
from app.routes_doctor import router as doctor_router

app = FastAPI(title="HepaCheck")

# Absolute paths — always correct regardless of CWD
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(_HERE, "static")),
    name="static",
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    if exc.status_code == 303:
        location = exc.headers.get("Location", "/login") if exc.headers else "/login"
        return RedirectResponse(location, status_code=303)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.get("/")
def root():
    return RedirectResponse(url="/login")