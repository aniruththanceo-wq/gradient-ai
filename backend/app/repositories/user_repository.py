from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import StudentProfile, User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()

    def get_by_google_sub(self, google_sub: str) -> User | None:
        return self.db.query(User).filter(User.google_sub == google_sub).first()

    def upsert_google_user(self, token_info: dict) -> User:
        user = self.get_by_google_sub(token_info["sub"])
        if user is None:
            user = User(
                google_sub=token_info["sub"],
                email=token_info["email"],
                display_name=token_info.get("name"),
                avatar_url=token_info.get("picture"),
            )
            self.db.add(user)
        else:
            user.email = token_info["email"]
            user.display_name = token_info.get("name")
            user.avatar_url = token_info.get("picture")
        self.db.flush()
        return user

    def get_profile(self, user_id: str) -> StudentProfile | None:
        return self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

