from fastapi import Depends, HTTPException
from app.dependencies.auth import get_user


def require(role):
    def checker(user=Depends(get_user)):
        if user["role"] != role:
            raise HTTPException(403)
        return user
    return checker