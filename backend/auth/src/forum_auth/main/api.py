import asyncio

from dishka import make_async_container, AsyncContainer
from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from sqladmin import Admin
from uvicorn import run
from fastapi.middleware.cors import CORSMiddleware

from forum_auth.infrastructure.config import ConfigProvider, Config
from forum_auth.infrastructure.database import DatabaseProvider, DatabaseEngine
from forum_auth.presentation import api
from forum_auth.presentation.admin.auth_backend import SQLAdminAuth
from forum_auth.presentation.api.schemas.tags_metadata import tags_metadata
from forum_auth.presentation import admin


app = FastAPI(
    root_path="/api",
    openapi_tags=tags_metadata,
    title="FORUM REST API",
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api.router)


async def include_admin(container: AsyncContainer, app_instance):
    engine = await container.get(DatabaseEngine)
    config = await container.get(Config)
    admin_instance = Admin(
        app_instance,
        engine,
        authentication_backend=SQLAdminAuth(config),
    )

    admin_instance.add_view(admin.user.UserView)
    admin_instance.add_view(admin.user_session.UserSessionView)


async def prepare():
    container = make_async_container(
        ConfigProvider(),
        DatabaseProvider(),
    )
    # await include_admin(container, app)
    setup_dishka(container, app)


def main():
    asyncio.run(prepare())

    run(
        app=app,
        host="0.0.0.0",
        port=8000,
    )
