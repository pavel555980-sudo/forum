from datetime import datetime
from functools import total_ordering
from typing import Annotated, List

from pydantic import Field, ConfigDict, UUID4, PlainSerializer
from pydantic.functional_validators import BeforeValidator

from forum_basic.infrastructure.dto import BaseDTO
from pygments.lexers import q

Timestamp = Annotated[datetime, PlainSerializer(
    lambda x: int(x.timestamp()),
    return_type=int,
    when_used="json",
)]

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
    Timestamp,
    Field(
        title="Created at.",
    )
]

UpdatedAt = Annotated[
    Timestamp,
    Field(
        title="Updated at.",
    )
]

ID = Annotated[
    int,
    Field(
        title="ID.",
    )
]

JWT = Annotated[
    str,
    Field(
        title="JWT",
    )
]

class ReplyDTO(BaseDTO):
    id: ID
    user_id: UserID
    content: Content
    created_at: CreatedAt
    updated_at: UpdatedAt

class CreateReplyDTO(BaseDTO):
    jwt: JWT
    content: Content

Replies = Annotated[
    List[ReplyDTO],
    Field(
        title="Comment's replies.",
    )
]

class CommentDTO(BaseDTO):
    id: ID
    user_id: UserID
    content: Content
    created_at: CreatedAt
    updated_at: UpdatedAt
    replies: List[ReplyDTO]

class CreateCommentDTO(BaseDTO):
    jwt: JWT
    content: Content

Comments = Annotated[
    List[CommentDTO],
    Field(
        title="Thread's comments.",
    )
]

class CreateThreadDTO(BaseDTO):
    jwt: JWT
    header: Header
    content: Content

class ThreadDTO(BaseDTO):
    id: ID
    user_id: UserID
    created_at: CreatedAt
    updated_at: UpdatedAt
    header: Header
    content: Content
    comments: Comments

class UpdateContentDTO(BaseDTO):
    jwt: JWT
    content: Content
