from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from backend.config import settings

engine = create_async_engine(
    url=settings.DATABASE_URL,
    echo=True
)

async def create_db_tables():
    async with engine.begin() as conn:
        from backend.database.models import URLS
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session():
    async_session = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    async with async_session() as session:
        yield session