from fastapi import status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from backend.database.models import Users
from backend.api.schemas.users import UserCreate
from backend.utils import generate_access_token

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated='auto'
)

class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.model = Users

    async def add_user(self, data: UserCreate) -> Users:
        existing_user = await self._get_by_email(data.email)
        print(f'existing user {existing_user}')
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        user = self.model(
            name=data.name,
            email=data.email,
            password_hash=password_context.hash(data.password),
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

        if user is None or not password_context.verify(password, user.password_hash):
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