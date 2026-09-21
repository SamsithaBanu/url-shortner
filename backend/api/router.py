from fastapi import APIRouter
from backend.api.routers.urls import urls_router, redirect_router
from backend.api.routers.users import user_router

# API routes for CRUD operations
master_router = APIRouter()

master_router.include_router(urls_router)
master_router.include_router(user_router)
master_router.include_router(redirect_router)