from fastapi import Header, HTTPException, status
import os

API_KEY_ENV = "HEPACHEK_API_KEY"

async def require_api_key(x_api_key: str | None = Header(default=None)):
    expected = os.getenv(API_KEY_ENV)
    if expected:  # enforce only if env var is set
        if not x_api_key or x_api_key != expected:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key"
            )
