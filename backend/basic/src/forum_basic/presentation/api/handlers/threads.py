import os
from datetime import datetime

import jwt
from dishka.integrations.fastapi import inject, FromDishka
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from forum_basic.domain.models import Thread, Comment, Reply
from forum_basic.infrastructure.database import DatabaseSession
from forum_basic.infrastructure.dto import BaseRootDTO
from forum_basic.presentation.api.schemas.schemas import ThreadDTO, CreateThreadDTO, CommentDTO, CreateCommentDTO, \
    ReplyDTO, UpdateContentDTO

from pydantic import UUID4
from sqlalchemy import select

router = APIRouter(prefix="/thread", tags=["thread"])

SECRET_KEY = os.getenv("APP__SECRET_JWT_KEY")


@router.post(
    "/",
    status_code=201,
    response_model=ThreadDTO,
    name="CreateThread",
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
async def create_new_thread(
    payload: CreateThreadDTO,
    session: FromDishka[DatabaseSession],
):
    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    thread = Thread(
        user_id=data["user_id"],
        header=payload.header,
        content=payload.content,
    )

    session.add(thread)
    await session.commit()
    await session.flush()
    await session.refresh(thread)

    return ThreadDTO.model_validate(thread)

@router.post(
    "/{thread_id}",
    status_code=201,
    response_model=CommentDTO,
    name="LeaveComment",
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Thread with this id does not exist"
                    }
                }
            }
        }
    }
)
@inject
async def leave_comment(
    thread_id: int,
    payload: CreateCommentDTO,
    session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")

    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    comment = Comment(
        user_id=data["user_id"],
        content=payload.content,
        thread_id=thread_id,
    )
    session.add(comment)
    await session.commit()
    await session.flush()
    await session.refresh(comment)

    return CommentDTO.model_validate(comment)

@router.post(
    "/{thread_id}/{comment_id}",
    status_code=201,
    response_model=ReplyDTO,
    name="LeaveReply",
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Thread with this id does not exist"
                    }
                }
            }
        }
    }
)
@inject
async def leave_reply(
    thread_id: int,
    comment_id: int,
    payload: CreateCommentDTO,
    session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")

    stmt = select(Comment).where(Comment.id == comment_id)
    comment = (await session.scalars(stmt)).one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    reply = Reply(
        user_id=data["user_id"],
        content=payload.content,
        comment_id=comment_id,
    )
    session.add(reply)
    await session.commit()
    await session.flush()
    await session.refresh(reply)

    return ReplyDTO.model_validate(reply)


@router.put(
    "/{thread_id}",
    status_code=201,
    response_model=ThreadDTO,
    name="ChangeContent",
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Thread with this id does not exist"
                    }
                }
            }
        }
    }
)
@inject
async def change_thread_content(
        thread_id: int,
        payload: UpdateContentDTO,
        session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread with this id does not exist")

    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    if thread.user_id != data["user_id"]:
        raise HTTPException(status_code=403, detail="User cant change content")
    thread.content = payload.content
    await session.commit()
    await session.flush()
    return ThreadDTO.model_validate(thread)

@router.put(
    "/{thread_id}/{comment_id}",
    status_code=201,
    response_model=CommentDTO,
    name="ChangeContent",
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Comment with this id does not exist"
                    }
                }
            }
        }
    }
)
@inject
async def change_comment_content(
        thread_id: int,
        comment_id: int,
        payload: UpdateContentDTO,
        session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread with this id does not exist")
    stmt = select(Comment).where(Comment.id == comment_id)
    comment = (await session.scalars(stmt)).one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment with this id does not exist")

    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    if thread.user_id != data["user_id"]:
        raise HTTPException(status_code=403, detail="User cant change content")
    comment.content = payload.content
    await session.commit()
    await session.flush()
    return CommentDTO.model_validate(comment)

@router.put(
    "/{thread_id}/{comment_id}/{reply_id}",
    status_code=201,
    response_model=ReplyDTO,
    name="ChangeReply",
    responses={
        404: {
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Reply with this id does not exist"
                    }
                }
            }
        }
    }
)
@inject
async def change_reply_content(
        thread_id: int,
        comment_id: int,
        reply_id: int,
        payload: ReplyDTO,
        session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread with this id does not exist")
    stmt = select(Comment).where(Comment.id == comment_id)
    comment = (await session.scalars(stmt)).one_or_none()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment with this id does not exist")
    stmt = select(Reply).where(Reply.id == reply_id)
    reply = (await session.scalars(stmt)).one_or_none()
    if reply is None:
        raise HTTPException(status_code=404, detail="Reply with this id does not exist")

    data = jwt.decode(payload.jwt, SECRET_KEY, algorithms=["HS256"])

    if thread.user_id != data["user_id"]:
        raise HTTPException(status_code=403, detail="User cant change content")

    reply.content = payload.content
    await session.commit()
    await session.flush()
    return ReplyDTO.model_validate(reply)

ThreadsListDTO = BaseRootDTO[list[ThreadDTO]]

@router.get(
    "",
    status_code=200,
    response_model=ThreadsListDTO,
    name="ShowNewThreads",
)
@inject
async def show_new_threads(
        session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).order_by(Thread.id.desc())
    threads = await session.scalars(stmt)
    return ThreadsListDTO.model_validate(threads)

@router.get(
    "/{thread_id}",
    status_code=200,
    response_model=ThreadDTO,
    name="ShowThread",
)
@inject
async def show_thread(
        thread_id: int,
        session: FromDishka[DatabaseSession],
):
    stmt = select(Thread).where(Thread.id == thread_id)
    thread = (await session.scalars(stmt)).one_or_none()
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread with this id does not exist")
    return ThreadDTO.model_validate(thread)