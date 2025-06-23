from dishka.integrations.fastapi import inject, FromDishka
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import select
from pydantic import UUID4

from forum_auth.domain.models.user import User
from forum_auth.infrastructure.database import DatabaseSession
from forum_auth.domain.models.user_session import UserSession

from forum_auth.presentation.api.schemas.schemas import FriendsDTO

router = APIRouter(prefix="/user/{user_session}", tags=["user"])


@router.get(
    "/get_friends",
    name="",
    status_code=200,
    response_model=UserTotalRateDTO,
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Session {user_session} not found",
                        "object": "user",
                    }
                }
            },
        }
    },
)
@inject
async def get_friends(session_token: UUID4, session: FromDishka[DatabaseSession]):
    stmt = select(UserSession).where(UserSession.session_token == session_token)
    session: UserSession = (await session.scalars(stmt)).one_or_none()
    if not session:
        return JSONResponse(
            status_code=404,
            content={
                "detail": f"Session {session_token} not found",
                "object": "user_session",
            },
        )
    user = session.user
    return FriendsDTO.model_validate(user)
