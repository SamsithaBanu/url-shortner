from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, func
from pydantic import EmailStr


class URLS(SQLModel, table=True):
    __tablename__ = 'urls'

    id: int | None = Field(default=None, primary_key=True)
    origin_url: str = Field(sa_column=Column(Text, nullable=False))
    short_code: str = Field(sa_column=Column(String(30), unique=True, index=True))
    created_at: str | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    clicks: int = Field(default=0, sa_column=Column(Integer, default=0, nullable=False))
    is_active: bool = Field(default=True, sa_column=Column(Boolean, default=True, nullable=False))

    user_id: int | None = Field(default=None, foreign_key="users.id")
    user: "Users" = Relationship(
        back_populates="urls",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class Users(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column=Column(Text, nullable=False))
    password_hash: str = Field(sa_column=Column(Text, nullable=False))
    email: EmailStr = Field(sa_column=Column(String(255), unique=True, index=True, nullable=False))
    created_at: str | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))

    urls: list[URLS] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"lazy": "selectin"},
    )