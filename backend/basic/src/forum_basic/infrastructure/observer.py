from __future__ import annotations

from typing import Callable, Generic, TypeVar, Any
from abc import ABC


class BaseEvent:
    pass


_ET = TypeVar("_ET", bound=BaseEvent)  # event type


class Handler(Generic[_ET]):
    def __init__(self):
        self._handlers = []

    async def process(self, event: _ET):
        for i in self._handlers:
            await i(event)

    __call__ = process

    def add(self, handler: Callable[[_ET], Any]):
        self._handlers.append(handler)

    def remove(self, handler: Callable[[_ET], Any]):
        self._handlers.remove(handler)

    __add__ = add
    __sub__ = remove


class BaseObserver(ABC):
    def include(self, other: BaseObserver) -> None:
        for my, oth in zip((self, other)):
            my += oth

    def __iter__(self):
        return (i for i in vars(self).values() if isinstance(i, Handler))
