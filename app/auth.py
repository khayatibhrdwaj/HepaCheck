from jose import jwt, JWTError
from fastapi import Request
from fastapi.exceptions import HTTPException
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "hepacheck-dev-secret-change-in-prod")
ALGORITHM  = "HS256"


def require_role(request: Request, role: str) -> dict:
    """
    Decode the JWT cookie and verify the expected role.
    Raises HTTP 303 → /login if missing, expired, or wrong role.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=303, headers={"Location": "/login"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=303, headers={"Location": "/login"})

    if payload.get("role") != role:
        # Logged in as a different role → send to their own dashboard
        actual_role = payload.get("role", "")
        dest = f"/{actual_role}/home" if actual_role in ("patient", "doctor") else "/login"
        raise HTTPException(status_code=303, headers={"Location": dest})

    return payload
