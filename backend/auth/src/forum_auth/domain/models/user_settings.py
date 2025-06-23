from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
import uuid
from sqlalchemy import ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID


from forum_auth.infrastructure.relational_entity import (
    BaseRelationalEntity,
)


class UserSettings(BaseRelationalEntity):
    __tablename__ = "user_settings"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="cascade"), primary_key=True
    )
    is_dark_theme: Mapped[bool] = mapped_column(default=False)
    is_accepting_new_friends: Mapped[bool] = mapped_column(default=True)
    is_mail_notifications_enabled: Mapped[bool] = mapped_column(default=False)
    is_using_mail_2fa: Mapped[bool] = mapped_column(default=False)
    country: Mapped[str] = mapped_column()
    town: Mapped[str] = mapped_column()
