from __future__ import annotations

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)


class UserRoles(BaseRelationalEntity):
    __tablename__ = "user_roles"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), default=uuid.uuid4, primary_key=True
    )
    name: Mapped[str] = mapped_column()
    can_use_global_activity: Mapped[bool] = mapped_column()
    can_send_messages: Mapped[bool] = mapped_column()
    can_make_new_friends: Mapped[bool] = mapped_column()
    have_mod_access: Mapped[bool] = mapped_column()
