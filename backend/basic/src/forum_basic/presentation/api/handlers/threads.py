from datetime import datetime

from dishka.integrations.fastapi import inject, FromDishka
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from forum_basic.domain.models import Thread, Comment, Reply
from forum_basic.infrastructure.database import DatabaseSession
from forum_basic.presentation.api.schemas.schemas import ThreadDTO, CreateThreadDTO, CommentDTO, CreateCommentDTO, \
    ReplyDTO, UpdateContentDTO

from pydantic import UUID4
from sqlalchemy import select

router = APIRouter(prefix="/thread", tags=["thread"])


@router.post(
    "/create",
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
    thread = Thread(
        user_id=payload.user_id,
        header=payload.header,
        content=payload.content,
    )

    session.add(thread)
    await session.commit()
    await session.flush()

    return ThreadDTO.model_validate(thread)

@router.post(
    "/{thread_id}/leave_comment",
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

    comment = Comment(
        user_id=payload.user_id,
        content=payload.content,
        thread_id=thread_id,
    )
    session.add(comment)
    await session.commit()
    await session.flush()
    return CommentDTO.model_validate(comment)

@router.post(
    "/{thread_id}/{comment_id}/reply}",
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

    reply = Reply(
        user_id=payload.user_id,
        content=payload.content,
        comment_id=comment_id,
    )
    session.add(reply)
    await session.commit()
    await session.flush()
    return ReplyDTO.model_validate(reply)


@router.post(
    "/{thread_id}/change_content",
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
    thread.content = payload.content
    await session.commit()
    await session.flush()
    return ThreadDTO.model_validate(thread)

@router.post(
    "/{thread_id}/{comment_id}/change_content}",
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
    comment.content = payload.content
    await session.commit()
    await session.flush()
    return CommentDTO.model_validate(comment)

@router.post(
    "/{thread_id}/{comment_id}/{reply_id}/change_content",
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
    reply.content = payload.content
    await session.commit()
    await session.flush()
    return ReplyDTO.model_validate(reply)