from __future__ import annotations

from typing import Generic, TypeVar

from sqlalchemy.orm import Session


ModelT = TypeVar("ModelT")


class OwnedRepository(Generic[ModelT]):
    def __init__(self, db: Session, model: type[ModelT]) -> None:
        self.db = db
        self.model = model

    def list_for_user(self, user_id: str) -> list[ModelT]:
        return self.db.query(self.model).filter(self.model.user_id == user_id).all()

    def get_for_user(self, user_id: str, entity_id: str) -> ModelT | None:
        return self.db.query(self.model).filter(self.model.id == entity_id, self.model.user_id == user_id).first()

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.flush()
        return entity

    def delete(self, entity: ModelT) -> None:
        self.db.delete(entity)

