from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import IdMixin, TimestampMixin


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    google_sub: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(200))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile: Mapped["StudentProfile | None"] = relationship(back_populates="user", cascade="all, delete-orphan")


class StudentProfile(IdMixin, TimestampMixin, Base):
    __tablename__ = "student_profiles"
    __table_args__ = (UniqueConstraint("user_id", name="uq_student_profile_user"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    college: Mapped[str] = mapped_column(String(240), nullable=False)
    department: Mapped[str] = mapped_column(String(160), nullable=False)
    academic_year: Mapped[int] = mapped_column(Integer, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str | None] = mapped_column(String(80))

    user: Mapped[User] = relationship(back_populates="profile")
