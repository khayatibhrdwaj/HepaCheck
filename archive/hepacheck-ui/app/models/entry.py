from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from datetime import datetime
from app.core.db import Base


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    fib4 = Column(Float)
    apri = Column(Float)
    risk_level = Column(String)
    is_emergency = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)