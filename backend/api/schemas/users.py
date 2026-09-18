from pydantic import BaseModel, EmailStr


class BaseUser(BaseModel):
    name: str
    email: EmailStr


class UserRead(BaseUser):
    pass

class UserCreate(BaseUser):
    password: str