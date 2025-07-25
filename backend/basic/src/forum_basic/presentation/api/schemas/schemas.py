from datetime import datetime
from functools import total_ordering
from typing import Annotated, List

from pydantic import Field, ConfigDict, UUID4, PlainSerializer
from pydantic.functional_validators import BeforeValidator

from forum_basic.infrastructure.dto import BaseDTO
from pygments.lexers import q

UserID = Annotated[
    UUID4,
    Field(
        title="Идентификатор пользователя.",
    ),
]

Header = Annotated[
    str,
    Field(
        title="Threads header.",
    )
]

Content = Annotated[
    str,
    Field(
        title="Object's content.",
    )
]

CreatedAt = Annotated[
    datetime,
    Field(
        title="Created at.",
    )
]

UpdatedAt = Annotated[
    datetime,
    Field(
        title="Updated at.",
    )
]

class ReplyDTO(BaseDTO):
    user_id: UserID
    content: Content
    createdAt: CreatedAt
    updatedAt: UpdatedAt

class CreateReplyDTO(BaseDTO):
    user_id: UserID
    content: Content

Replies = Annotated[
    List[ReplyDTO],
    Field(
        title="Comment's replies.",
    )
]

class CommentDTO(BaseDTO):
    user_id: UserID
    content: Content
    createdAt: CreatedAt
    updatedAt: UpdatedAt
    replies: List[ReplyDTO]

class CreateCommentDTO(BaseDTO):
    user_id: UserID
    content: Content

Comments = Annotated[
    List[CommentDTO],
    Field(
        title="Thread's comments.",
    )
]

class CreateThreadDTO(BaseDTO):
    user_id: UserID
    header: Header
    content: Content

class ThreadDTO(BaseDTO):
    user_id: UserID
    created_at: CreatedAt
    updated_at: UpdatedAt
    header: Header
    content: Content
    comments: Comments

class UpdateContentDTO(BaseDTO):
    content: Content
