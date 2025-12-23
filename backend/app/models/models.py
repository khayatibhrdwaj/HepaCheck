
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from datetime import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String)
    diabetes = Column(Boolean, default=False)
    bmi = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class LabResult(Base):
    __tablename__ = "lab_results"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    alt = Column(Float)
    ast = Column(Float)
    platelets = Column(Float)
    albumin = Column(Float)
    glucose = Column(Float)
    insulin = Column(Float)
    taken_at = Column(DateTime, default=datetime.utcnow)

    
