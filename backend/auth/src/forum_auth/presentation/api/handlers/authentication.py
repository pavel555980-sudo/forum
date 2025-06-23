from datetime import datetime

import bcrypt
from dishka.integrations.fastapi import inject, FromDishka
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import UUID4
from sqlalchemy import select, ScalarResult

from forum_auth.domain.models.user import User
from forum_auth.domain.models.user_session import UserSession
from forum_auth.infrastructure.database import DatabaseSession
from forum_auth.presentation.api.schemas.schemas import (
    AuthResponseDTO,
    AuthDTO,
    UserRegisterResponse,
    UserRegisterForm,
    UserDTO,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    status_code=201,
    response_model=UserRegisterResponse,
    name="Зарегистрироваться",
    responses={
        403: {
            "content": {
                "application/json": {
                    "example": {"detail": "User with this nickname already exists"}
                }
            },
        }
    },
)
@inject
async def create_new_account(
    payload: UserRegisterForm,
    session: FromDishka[DatabaseSession],
):
    stmt = select(User).where(User.nick == payload.nick)
    users: ScalarResult = await session.scalars(stmt)
    if users.one_or_none():
        raise HTTPException(403, "User with this nickname already exists")
    salt = bcrypt.gensalt()
    user = User(
        nick=payload.nick,
        name=payload.name,
        lastname=payload.lastname,
        email=payload.email,
        password=bcrypt.hashpw(salt=salt, password=payload.password.encode()).decode(
            "utf-8"
        ),
    )
    session.add(user)
    await session.flush()
    await session.commit()

    return UserRegisterResponse.model_validate(user)


@router.post(
    "",
    response_model=AuthResponseDTO,
    name="Создать сессию входа в систему",
    responses={
        401: {
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid password or username"}
                }
            },
        }
    },
)
@inject
async def create_new_session(
    payload: AuthDTO,
    session: FromDishka[DatabaseSession],
):
    """Вход в систему

    Для входа необходим логин и пароль.  Последующие запросы к
    приложению должны содержать токен, который выдаётся в ответе к этому
    запросу.

    """

    stmt = select(User).where(User.nick == payload.nick)
    users: ScalarResult = await session.scalars(stmt)
    user: User = users.one_or_none()
    if user is None or not bcrypt.checkpw(
        password=payload.password.encode(),
        hashed_password=user.password.encode("utf-8"),
    ):
        raise HTTPException(status_code=401, detail="Invalid password or username")

    user_session = UserSession(user_id=user.id)
    session.add(user_session)
    await session.flush()
    await session.commit()

    return AuthResponseDTO.model_validate(user_session)


@router.get(
    "/me",
    name="Получение информации о пользователе по session_token",
    response_model=UserDTO,
    responses={
        401: {
            "content": {
                "application/json": {"example": {"detail": "Session not found"}}
            },
        },
        419: {
            "content": {"application/json": {"example": {"detail": "Session expired"}}}
        },
    },
)
@inject
async def get_user_by_session(
    session_token: UUID4, session: FromDishka[DatabaseSession]
):
    stmt = select(UserSession).where(UserSession.session_token == session_token)
    sessions = await session.scalars(stmt)
    user_session: UserSession = sessions.one_or_none()
    if not user_session:
        raise HTTPException(404, detail="Session not found")
    if (datetime.now() - user_session.created_at).days >= 5:
        await session.delete(user_session)
        await session.flush()
        await session.commit()
        raise HTTPException(419, detail="Session expired")
    user = user_session.user
    return UserDTO.model_validate(user)


@router.delete(
    "/close_session",
    status_code=200,
    name="Закрыть сессию",
)
@inject
async def close_session(
    session_token: UUID4,
    session: FromDishka[DatabaseSession],
):
    stmt = select(UserSession).where(UserSession.session_token == session_token)
    user_session = (await session.scalars(stmt)).one_or_none()
    if not user_session:
        raise HTTPException(404, f"Session {session_token} not found")
    await session.delete(user_session)
    await session.flush()
    await session.commit()
    return JSONResponse(
        status_code=200,
        content={
            "detail": f"Session {session_token} closed",
        },
    )
