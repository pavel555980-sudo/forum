from fastapi import APIRouter

from .handlers import threads

router = APIRouter(prefix="/v1")

router.include_router(threads.router)
