from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)


class User(BaseRelationalEntity):
    __tablename__ = "user"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)

    email: Mapped[str] = mapped_column()
    nick: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()
    lastname: Mapped[str] = mapped_column()
    password: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    sessions: Mapped[list[UserSession]] = relationship(back_populates="user")
    friends: Mapped[list[User]] = relationship(
        secondary=UserTotalRateDTO.__table__,
        lazy="selectin",
    )


class UserToFriend(BaseRelationalEntity):
    __tablename__ = "user_to_friend"
    id: Mapped[UUID] = mapped_column(default=uuid.uuid4)
    userId: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    friendId: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
