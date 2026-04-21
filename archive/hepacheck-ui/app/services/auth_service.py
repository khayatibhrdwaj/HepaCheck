from app.models.user import User
from app.core.security import verify_password


def authenticate(db, username, password):
    user = db.query(User).filter(User.username == username).first()

    if user and verify_password(password, user.password):
        return user
    return None