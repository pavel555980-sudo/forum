from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship

from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)


class UserSettings(BaseRelationalEntity):
    __tablename__ = "user_roles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    name: Mapped[str] = relationship()
    can_use_global_activity: Mapped[bool] = relationship()
    can_send_messages: Mapped[bool] = relationship()
    can_make_new_friends: Mapped[bool] = relationship()
    have_mod_access: Mapped[bool] = relationship()
