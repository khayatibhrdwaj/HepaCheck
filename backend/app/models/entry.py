from sqlalchemy import Column, Integer, Float, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.db import Base  # OK: Base is defined without importing Entry

class Entry(Base):
    __tablename__ = "entries"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # patient inputs
    age = Column(Float, nullable=True)
    ast = Column(Float, nullable=True)
    alt = Column(Float, nullable=True)
    platelets = Column(Float, nullable=True)
    albumin = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    diabetes = Column(Boolean, nullable=True)
    glucose = Column(Float, nullable=True)
    insulin = Column(Float, nullable=True)

    # computed outputs
    fib4 = Column(Float, nullable=True)
    fib4_risk = Column(Integer, nullable=True)  # 0=Low,1=Moderate,2=High
    apri = Column(Float, nullable=True)
    nfs = Column(Float, nullable=True)
    homa_ir = Column(Float, nullable=True)
