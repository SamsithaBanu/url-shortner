import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

class URLCreate(BaseModel):
    origin_url: str = Field(..., description='The long URL to shorten')
    custom_alias: str | None = Field(default=None, description='Custom short code alias (optional)')

    @field_validator("origin_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not re.match(r"^https?://", value.strip(), re.IGNORECASE):
            raise ValueError("Original long url should start with http:// or https://")
        return value.strip()

    @field_validator("custom_alias")
    @classmethod
    def validate_alias(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            if not value:
                return None
            if not re.match(r"^[a-zA-Z0-9_-]+$", value):
                raise ValueError("Custom alias can only contain letters, numbers, hyphens, and underscores")
            if len(value) < 3 or len(value) > 30:
                raise ValueError("Custom alias must be between 3 and 30 characters long")
        return value

class URLResponse(BaseModel):
    id: int
    short_code: str
    origin_url: str
    short_url: str
    created_at: datetime
    clicks: int
    is_active: bool
