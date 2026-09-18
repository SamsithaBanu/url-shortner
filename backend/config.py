from typing import ClassVar
from pydantic_settings import BaseSettings, SettingsConfigDict

_base_config = SettingsConfigDict(
        env_file="./.env",
        env_ignore_empty=True,
        extra="ignore"
    )

class DatabaseSettings(BaseSettings):
    DATABASE_PASSWORD: str
    DATABASE_USER: str
    DATABASE_DB: str
    DATABASE_SERVER: str
    DATABASE_PORT: int

    REDIS_HOST: str
    REDIS_PORT: str

    model_config = _base_config

    short_code_length: ClassVar[int] = 7

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_SERVER}:{self.DATABASE_PORT}/{self.DATABASE_DB}"


class SecuritySettings(BaseSettings):

    JWT_SECRET: str
    JWT_ALGORITHM: str

    model_config = _base_config

settings = DatabaseSettings()
security_settings = SecuritySettings()