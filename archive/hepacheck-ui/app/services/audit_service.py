from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(db: Session, user_id: int, action: str):
    log = AuditLog(user_id=user_id, action=action)
    db.add(log)
    db.commit()