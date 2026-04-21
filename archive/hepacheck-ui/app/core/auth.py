from fastapi import Header, HTTPException, status, Depends
import os

API_KEY_ENV = "HEPACHEK_API_KEY"


# 🔐 API key dependency (already correct, just cleaned slightly)
async def require_api_key(x_api_key: str | None = Header(default=None)):
    expected = os.getenv(API_KEY_ENV)

    if expected:  # enforce only if env var is set
        if not x_api_key or x_api_key != expected:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key",
            )


# 👤 Mock current user (replace later with real auth)
def get_current_user():
    # You can later decode JWT / session here
    return {
        "id": 1,
        "role": "patient"
    }


# 🔒 Role-based dependency
def require_role(role: str):
    def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )
        return user

    return role_checker
