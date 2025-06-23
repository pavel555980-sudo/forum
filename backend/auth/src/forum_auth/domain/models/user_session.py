from __future__ import annotations

from typing import TYPE_CHECKING
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)

if TYPE_CHECKING:
    from forum_auth.domain.models import User


class UserSession(BaseRelationalEntity):
    __tablename__ = "user_session"

    session_token: Mapped[UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    session_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="cascade"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    user: Mapped[User] = relationship(lazy='selectin')

    def __str__(self):
        return str(self.created_at)