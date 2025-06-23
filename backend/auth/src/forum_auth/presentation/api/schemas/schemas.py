from datetime import datetime
from functools import total_ordering
from typing import Annotated

from pydantic import Field, ConfigDict, UUID4, PlainSerializer
from pydantic.functional_validators import BeforeValidator

from forum_auth.infrastructure.dto import BaseDTO

"""
def action_check(action: str):
    actions = {
        "like": True,
        "dislike": False,
    }

    try:
        return actions[action.lower()]
    except KeyError:
        assert f"Action {action} invalid"


def raw_rate_to_rate(rate: bool):
    rates = {
        True: "like",
        False: "dislike",
    }

    return rates[rate]
"""

Nick = Annotated[
    str,
    Field(
        title="Ник пользователя.",
        description="Имя в приложении, по которому можно идентифицировать пользователя. "
        "Может использоваться вместо id, если на то есть объективные причины.",
    ),
]

Password = Annotated[
    str,
    Field(
        title="Пароль.",
    ),
]

UserID = Annotated[
    UUID4,
    Field(
        title="Идентификатор пользователя.",
    ),
]

Name = Annotated[
    str,
    Field(
        title="Имя пользователя.",
    ),
]

LastName = Annotated[
    str,
    Field(
        title="Фамиилия пользователя.",
    ),
]

UserEmail = Annotated[
    str,
    Field(
        title="Почта пользователя.",
    ),
]


SessionId = Annotated[
    int,
    Field(
        title="ID сессии.",
    ),
]

SessionToken = Annotated[
    UUID4,
    Field(
        title="Токен сессии.",
    ),
]


class UserDTO(BaseDTO):
    nick: Nick
    id: UserID
    email: UserEmail


Friends = Annotated[
    list[UserDTO],
    Field(
        title="All user friends.",
    ),
]


class UserRegisterForm(BaseDTO):
    nick: Nick
    name: Name
    lastname: LastName
    email: UserEmail
    password: Password


class UserRegisterResponse(BaseDTO):
    id: UserID
    nick: Nick
    name: Name
    lastname: LastName
    email: UserEmail


class AuthDTO(BaseDTO):
    nick: Nick
    password: Password


class AuthResponseDTO(BaseDTO):
    session_token: SessionToken
    session_id: SessionId
    user_id: UserID


class FriendsDTO(BaseDTO):
    user_id: UserID
    friends: Friends
