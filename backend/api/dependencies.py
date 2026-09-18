from typing import Annotated

from fastapi import status, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.utils import decode_access_token
from backend.database.redis import is_jti_blacklisted
from backend.core.security import oauth2_scheme_user
from backend.database.models import Users
from backend.database.session import get_session
from backend.services.urlservice import UrlService
from backend.services.userservice import UserService


# ============================================================
# DATABASE SESSION DEPENDENCY
# ============================================================

SessionDep = Annotated[
    AsyncSession,
    Depends(get_session)
]


# ============================================================
# ACCESS TOKEN
# ============================================================

async def _get_access_token(token: str) -> dict:
    """
    Decode and validate the JWT access token.
    """

    data = decode_access_token(token)

    # Invalid token or blacklisted JTI
    if data is None or await is_jti_blacklisted(
        data.get("jti", "")
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    return data


async def get_user_access_token(
    token: Annotated[
        str,
        Depends(oauth2_scheme_user)
    ],
) -> dict:
    """
    Get the access token from Authorization header
    and validate it.
    """

    return await _get_access_token(token)


# ============================================================
# CURRENT LOGGED-IN USER
# ============================================================

async def get_current_user(
    token_data: Annotated[
        dict,
        Depends(get_user_access_token)
    ],
    session: SessionDep,
) -> Users:
    """
    Get the currently logged-in user from the JWT.
    """

    # Expected JWT structure:
    #
    # {
    #     "user": {
    #         "id": 1
    #     },
    #     "jti": "...",
    #     "exp": "..."
    # }

    user_id_str = token_data.get("user", {}).get("id")

    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Convert user ID to integer
    try:
        user_id = int(user_id_str)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )

    # Find user in database
    user = await session.get(
        Users,
        user_id
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or unauthorized",
        )

    return user


# ============================================================
# SERVICE DEPENDENCIES
# ============================================================

def get_url_service(
    session: SessionDep,
) -> UrlService:
    return UrlService(session)


def get_user_service(
    session: SessionDep,
) -> UserService:
    return UserService(session)


# ============================================================
# TYPE ALIASES
# ============================================================

ServiceDep = Annotated[
    UrlService,
    Depends(get_url_service)
]


UserServiceDep = Annotated[
    UserService,
    Depends(get_user_service)
]


# Current logged-in user
UserDep = Annotated[
    Users,
    Depends(get_current_user)
]