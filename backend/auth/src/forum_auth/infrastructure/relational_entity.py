from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped

from .entity import BaseEntity
from .database import RelationalMapper


class BaseRelationalObject(BaseEntity, RelationalMapper):
    __abstract__ = True


class BaseRelationalEntity(BaseRelationalObject):
    __abstract__ = True

    if TYPE_CHECKING:  # I believe in the developers' neatness
        id: Mapped[int]


__all__ = [
    "BaseRelationalObject",
    "BaseRelationalEntity",
]
