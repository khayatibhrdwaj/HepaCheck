
from fastapi import FastAPI
from .api.scores import router as scores_router
from .core.db import init_db

app = FastAPI(title="HepaCheck API", version="0.1")

# Initialize DB (SQLite) on startup
init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

# API Routers
app.include_router(scores_router)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HepaCheck API", version="0.1")

# 🔹 Always allow frontend (permanent CORS setup)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.scores import router as scores_router
from .core.db import init_db

app = FastAPI(title="HepaCheck API", version="0.1")

# Permanent CORS (dev-friendly). Later, restrict allow_origins as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

# API routes
app.include_router(scores_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later if you want
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "HepaCheck API is running. See /docs"}




