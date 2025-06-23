from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID


from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)


class UserRoles(BaseRelationalEntity):
    __tablename__ = "user_roles"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), default=uuid.uuid4, primary_key=True
    )
    name: Mapped[str] = relationship()
    can_use_global_activity: Mapped[bool] = relationship()
    can_send_messages: Mapped[bool] = relationship()
    can_make_new_friends: Mapped[bool] = relationship()
    have_mod_access: Mapped[bool] = relationship()
