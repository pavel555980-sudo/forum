from __future__ import annotations

from typing import AsyncIterable

from dishka import Provider, provide, Scope
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession,
    AsyncAttrs, AsyncEngine,
)

from .config import Config

DatabaseEngine = AsyncEngine
DatabaseSession = AsyncSession


class DatabaseProvider(Provider):
    @provide(scope=Scope.APP)
    def get_engine(self, config: Config) -> DatabaseEngine:
        return create_async_engine(config.database.url)

    @provide(scope=Scope.REQUEST)
    async def get_session(self, engine: DatabaseEngine) -> AsyncIterable[DatabaseSession]:
        async with DatabaseSession(engine, expire_on_commit=False) as session:
            yield session


class RelationalMapper(DeclarativeBase, AsyncAttrs):
    pass
