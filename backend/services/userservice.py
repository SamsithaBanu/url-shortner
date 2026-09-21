import asyncio

import bcrypt
from fastapi import status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import Users
from backend.api.schemas.users import UserCreate
from backend.utils import generate_access_token


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # malformed hash, or a password longer than 72 bytes
        return False


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.model = Users

    async def add_user(self, data: UserCreate) -> Users:
        existing_user = await self._get_by_email(data.email)
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # bcrypt is CPU-heavy, so run it in a thread to avoid blocking the event loop
        password_hash = await asyncio.to_thread(hash_password, data.password)

        user = self.model(
            name=data.name,
            email=data.email,
            password_hash=password_hash,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def _get_by_email(self, email: str) -> Users | None:
        return await self.session.scalar(
            select(self.model).where(self.model.email == email)
        )

    async def token(self, email: str, password: str) -> str:
        user = await self._get_by_email(email)

        if user is None or not await asyncio.to_thread(
            verify_password, password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email or Password is incorrect"
            )
        return generate_access_token(
            data={
                "user": {
                    "name": user.name,
                    "id": str(user.id)
                }
            }
        )