from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float,
    Boolean, DateTime, Text, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

import os as _os
_DB_PATH = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "hepacheck.db")
DATABASE_URL = "sqlite:///" + _DB_PATH

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── Users ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True)
    username = Column(String)
    email    = Column(String, unique=True, index=True)
    password = Column(String)
    role     = Column(String)          # "patient" | "doctor"

    entries           = relationship("Entry",         back_populates="user",   cascade="all, delete")
    notifications     = relationship("Notification",  back_populates="user",   cascade="all, delete")
    flags_raised      = relationship("Flag",          back_populates="doctor", foreign_keys="Flag.doctor_id")

    doctor_profile    = relationship("DoctorProfile", back_populates="user",   uselist=False, cascade="all, delete")

    assigned_doctor   = relationship(
        "PatientDoctor",
        foreign_keys="PatientDoctor.patient_id",
        back_populates="patient",
        uselist=False,
        cascade="all, delete",
    )
    assigned_patients = relationship(
        "PatientDoctor",
        foreign_keys="PatientDoctor.doctor_id",
        back_populates="doctor_user",
    )

    community_posts   = relationship("CommunityPost", back_populates="author", cascade="all, delete")
    post_likes        = relationship("PostLike",       back_populates="user",   cascade="all, delete")


# ── Doctor Profile ────────────────────────────────────────────────────────────
class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id                  = Column(Integer, primary_key=True)
    user_id             = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    medical_licence     = Column(String, nullable=False)
    highest_degree      = Column(String, nullable=False)
    specialisation      = Column(String, nullable=False)
    years_practicing    = Column(Integer, nullable=False)
    clinic_hospital     = Column(String)
    city                = Column(String)
    bio                 = Column(Text)
    is_verified         = Column(Boolean, default=False)

    user = relationship("User", back_populates="doctor_profile")


# ── Patient ↔ Doctor assignment ───────────────────────────────────────────────
class PatientDoctor(Base):
    __tablename__ = "patient_doctor"

    id          = Column(Integer, primary_key=True)
    patient_id  = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    doctor_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    patient     = relationship("User", foreign_keys=[patient_id], back_populates="assigned_doctor")
    doctor_user = relationship("User", foreign_keys=[doctor_id],  back_populates="assigned_patients")


# ── Score Entries ─────────────────────────────────────────────────────────────
class Entry(Base):
    __tablename__ = "entries"

    id           = Column(Integer, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at   = Column(DateTime, default=datetime.utcnow, nullable=False)
    age          = Column(Float, nullable=False)
    ast          = Column(Float, nullable=False)
    alt          = Column(Float, nullable=False)
    platelets    = Column(Float, nullable=False)
    albumin      = Column(Float, nullable=False)
    bmi          = Column(Float, nullable=False)
    diabetes     = Column(Boolean, nullable=False)
    glucose      = Column(Float, nullable=False)
    insulin      = Column(Float, nullable=False)
    fib4         = Column(Float, nullable=False)
    apri         = Column(Float, nullable=False)
    nfs          = Column(Float, nullable=False)
    homa_ir      = Column(Float, nullable=False)
    risk_level   = Column(String,  nullable=False)
    is_emergency = Column(Boolean, nullable=False)

    user  = relationship("User", back_populates="entries")
    flags = relationship("Flag", back_populates="entry", cascade="all, delete")


# ── Flags ─────────────────────────────────────────────────────────────────────
class Flag(Base):
    __tablename__ = "flags"

    id         = Column(Integer, primary_key=True)
    entry_id   = Column(Integer, ForeignKey("entries.id"))
    doctor_id  = Column(Integer, ForeignKey("users.id"))
    note       = Column(Text, nullable=False, default="")
    status     = Column(String, nullable=False, default="open")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    entry  = relationship("Entry", back_populates="flags")
    doctor = relationship("User",  back_populates="flags_raised", foreign_keys=[doctor_id])


# ── Notifications ─────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    message    = Column(String)
    is_read    = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")


# ── Community Posts ───────────────────────────────────────────────────────────
class CommunityPost(Base):
    """Posts created by real, logged-in patients. No phantom/fake posts."""
    __tablename__ = "community_posts"

    id         = Column(Integer, primary_key=True)
    author_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    tag        = Column(String, nullable=False, default="Question")
    body       = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    author  = relationship("User", back_populates="community_posts")
    replies = relationship("PostReply", back_populates="post", cascade="all, delete", order_by="PostReply.created_at")
    likes   = relationship("PostLike",  back_populates="post", cascade="all, delete")


# ── Post Replies ──────────────────────────────────────────────────────────────
class PostReply(Base):
    __tablename__ = "post_replies"

    id         = Column(Integer, primary_key=True)
    post_id    = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    author_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    body       = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    post   = relationship("CommunityPost", back_populates="replies")
    author = relationship("User")


# ── Post Likes (one per user per post, enforced by DB unique constraint) ──────
class PostLike(Base):
    __tablename__ = "post_likes"

    id      = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # This UniqueConstraint is the source-of-truth for one-like-per-user-per-post
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_like"),
    )

    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User",          back_populates="post_likes")


# ── DB helpers ────────────────────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()