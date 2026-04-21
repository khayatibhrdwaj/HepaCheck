from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.app.models.base_models import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    action = Column(String)
    user_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)