from fastapi import FastAPI

from .api.scores import router as scores_router

app = FastAPI(title="HepaCheck API")

app.include_router(scores_router)


@app.get("/")
def root():
    return {"status": "HepaCheck backend running"}
