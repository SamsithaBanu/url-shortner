from backend.config import settings
from starlette.responses import RedirectResponse
from fastapi import APIRouter, HTTPException, status

from backend.database.models import URLS
from backend.api.dependencies import ServiceDep, UserDep
from backend.api.schemas.urls import URLCreate, URLResponse


# ============================================================
# AUTHENTICATED URL ROUTES
# ============================================================

urls_router = APIRouter(
    prefix="/api/urls",
    tags=["urls"]
)


# ============================================================
# PUBLIC REDIRECT ROUTES
# ============================================================

redirect_router = APIRouter(
    tags=["redirect"]
)


# ============================================================
# RESPONSE CONVERTER
# ============================================================

def to_response(db_url: URLS) -> URLResponse:
    base = settings.BASE_URL.rstrip("/")
    return URLResponse(
        id=db_url.id,
        short_code=db_url.short_code,
        origin_url=db_url.origin_url,
        short_url=f"{base}/{db_url.short_code}",
        created_at=db_url.created_at,
        clicks=db_url.clicks,
        is_active=db_url.is_active,
    )


# ============================================================
# CREATE SHORT URL
# ============================================================

@urls_router.post(
    "/",
    response_model=URLResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_short_url(
    service: ServiceDep,
    user: UserDep,
    url_create: URLCreate,
):

    new_url = await service.create_short_url(
        url_create,
        user.id
    )

    return to_response(new_url)


# ============================================================
# GET ALL LOGGED-IN USER URLS
# ============================================================

@urls_router.get(
    "/",
    response_model=list[URLResponse]
)
async def get_all_url(
    service: ServiceDep,
    user: UserDep,
):

    urls = await service.get_all(
        user_id=user.id
    )

    return [
        to_response(url)
        for url in urls
    ]


# ============================================================
# GET ONE URL
# ============================================================

@urls_router.get(
    "/{short_code}",
    response_model=URLResponse
)
async def get_short_url(
    service: ServiceDep,
    user: UserDep,
    short_code: str,
):

    # IMPORTANT:
    # Only retrieve this URL if it belongs to
    # the logged-in user.

    short_url = await service.get_user_url_by_code(
        short_code,
        user.id
    )

    if short_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found"
        )

    return to_response(short_url)


# ============================================================
# DELETE SHORT URL
# ============================================================

@urls_router.delete(
    "/{short_code}"
)
async def delete_short_url(
    service: ServiceDep,
    user: UserDep,
    short_code: str,
):

    return await service.delete_short_url(
        short_code,
        user.id
    )


# ============================================================
# PUBLIC REDIRECT
# ============================================================

@redirect_router.get(
    "/{short_code}"
)
async def redirect_to_original(
    short_code: str,
    service: ServiceDep,
):

    # No UserDep here.
    #
    # Anyone should be able to visit:
    #
    # http://localhost:8015/abc123

    db_url = await service.get_by_code(
        short_code
    )

    if db_url is None or not db_url.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found"
        )

    await service.increment_click_count(
        db_url
    )

    return RedirectResponse(
        url=db_url.origin_url,
        status_code=302
    )