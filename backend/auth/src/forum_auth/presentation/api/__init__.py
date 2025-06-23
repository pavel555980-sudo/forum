from fastapi import APIRouter

from .handlers import authentication, user

router = APIRouter(prefix="/v1")

router.include_router(authentication.router)
router.include_router(user.router)
