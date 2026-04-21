from fastapi import Request, HTTPException


def get_user(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(401)
    return user