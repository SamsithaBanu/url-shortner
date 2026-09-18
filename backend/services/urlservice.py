import secrets
import string

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.schemas.urls import URLCreate, URLResponse
from backend.database.models import URLS
from backend.config import settings

ALPHABET = string.ascii_letters + string.digits

class UrlService:

    def __init__(self, session: AsyncSession):
        self.session = session

    # ============================================================
    # GENERATE SHORT CODE
    # ============================================================

    def generate_short_code(
        self,
        length: int | None = None
    ) -> str:

        length = length or settings.short_code_length

        return "".join(
            secrets.choice(ALPHABET)
            for _ in range(length)
        )

    # ============================================================
    # GET URL BY SHORT CODE
    # PUBLIC
    # ============================================================

    async def get_by_code(
        self,
        short_code: str
    ) -> URLS | None:

        statement = (
            select(URLS)
            .where(
                URLS.short_code == short_code
            )
        )

        result = await self.session.execute(statement)

        return result.scalars().first()

    # ============================================================
    # GET URL BY SHORT CODE + USER
    # PRIVATE / AUTHENTICATED
    # ============================================================

    async def get_user_url_by_code(
        self,
        short_code: str,
        user_id: int
    ) -> URLS | None:

        statement = (
            select(URLS)
            .where(
                URLS.short_code == short_code,
                URLS.user_id == user_id
            )
        )

        result = await self.session.execute(statement)

        return result.scalars().first()

    # ============================================================
    # GET ALL URLS FOR LOGGED-IN USER
    # ============================================================

    async def get_all(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[URLS]:

        statement = (
            select(URLS)
            .where(
                URLS.user_id == user_id
            )
            .order_by(
                URLS.created_at.desc()
            )
            .offset(skip)
            .limit(limit)
        )

        result = await self.session.execute(statement)

        return result.scalars().all()

    # ============================================================
    # CREATE SHORT URL
    # ============================================================

    async def create_short_url(
        self,
        url_create: URLCreate,
        user_id: int
    ) -> URLS:

        # --------------------------------------------------------
        # CUSTOM ALIAS
        # --------------------------------------------------------

        if url_create.custom_alias:

            code = url_create.custom_alias

            existing_url = await self.get_by_code(code)

            if existing_url is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "This custom alias is already taken. "
                        "Please choose another one."
                    )
                )

        # --------------------------------------------------------
        # RANDOM SHORT CODE
        # --------------------------------------------------------

        else:

            code = self.generate_short_code()

            while await self.get_by_code(code) is not None:
                code = self.generate_short_code()

        # --------------------------------------------------------
        # CREATE DATABASE OBJECT
        # --------------------------------------------------------

        new_url = URLS(
            short_code=code,
            origin_url=url_create.origin_url,

            # IMPORTANT:
            # Associate this URL with the logged-in user
            user_id=user_id,
        )

        self.session.add(new_url)

        await self.session.commit()

        await self.session.refresh(new_url)

        return new_url

    # ============================================================
    # DELETE URL
    # ============================================================

    async def delete_short_url(
        self,
        short_code: str,
        user_id: int
    ):

        # Only find the URL if it belongs to this user
        short_url = await self.get_user_url_by_code(
            short_code,
            user_id
        )

        if short_url is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Short URL not found"
            )

        await self.session.delete(short_url)

        await self.session.commit()

        return {
            "message": "Short URL deleted successfully"
        }

    # ============================================================
    # INCREMENT CLICK COUNT
    # ============================================================

    async def increment_click_count(
        self,
        db_url: URLS
    ):

        db_url.clicks += 1

        self.session.add(db_url)

        await self.session.commit()