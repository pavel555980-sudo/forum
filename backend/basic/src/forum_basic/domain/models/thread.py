from __future__ import annotations

from datetime import datetime

from forum_basic.infrastructure.relational_entity import BaseRelationalEntity
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Reply(BaseRelationalEntity):
    __tablename__ = "reply"

    id: Mapped[int] = mapped_column(
        autoincrement=True,
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now)
    visible: Mapped[bool] = mapped_column(default=True)
    comment_id: Mapped[int] = mapped_column(ForeignKey("comment.id"))
    comment: Mapped["Comment"] = relationship(back_populates="replies", lazy='raise')

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True))
    content: Mapped[str] = mapped_column()

class Comment(BaseRelationalEntity):
    __tablename__ = "comment"

    id: Mapped[int] = mapped_column(
        autoincrement=True,
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now)
    visible: Mapped[bool] = mapped_column(default=True)
    thread_id: Mapped[int] = mapped_column(ForeignKey("thread.id"))
    thread: Mapped["Thread"] = relationship(back_populates="comments", lazy='raise')

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True))
    content: Mapped[str] = mapped_column()
    replies: Mapped[list[Reply]] = relationship(
        lazy='selectin',
        back_populates="comment",
        cascade="all, delete-orphan",
    )

class Thread(BaseRelationalEntity):
    __tablename__ = "thread"

    id: Mapped[int] = mapped_column(
        autoincrement=True,
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now)
    visible: Mapped[bool] = mapped_column(default=True)

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True))
    header: Mapped[str] = mapped_column()
    content: Mapped[str] = mapped_column()
    comments: Mapped[list[Comment]] = relationship(
        lazy='selectin',
        back_populates="thread",
        cascade="all, delete-orphan",
    )