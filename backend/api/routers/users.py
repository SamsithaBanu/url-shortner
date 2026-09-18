from backend.api.dependencies import get_current_user
from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from backend.database.redis import add_jti_to_blacklist
from backend.api.dependencies import  UserServiceDep, get_user_access_token
from backend.api.schemas.users import UserRead, UserCreate

user_router = APIRouter(prefix='/api/users', tags=['users'])


@user_router.post('/register', response_model=UserRead)
async def register_user(data: UserCreate, service: UserServiceDep) -> UserRead:
    return await service.add_user(data)

@user_router.post('/token')
async def login_user(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep
):
    token = await service.token(request_form.username, request_form.password)
    return {
        "access_token": token,
        "token_type": "bearer"
    }
@user_router.get("/me")
async def current_user(
    user: Annotated[dict, Depends(get_current_user)]
):
    return user

@user_router.post("/logout")
async def logout_seller(
    token_data: Annotated[dict, Depends(get_user_access_token)],
):
    await add_jti_to_blacklist(token_data["jti"])
    return {
        "detail": "Successfully logged out"
    }