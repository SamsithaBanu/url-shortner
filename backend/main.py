from backend.database.session import create_db_tables
from contextlib import asynccontextmanager
from backend.api.router import master_router
from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

@asynccontextmanager
async def lifespan_handler(app):
    await create_db_tables()
    yield


app = FastAPI(
    lifespan=lifespan_handler
)

app.include_router(master_router)

@app.get("/scalar", include_in_schema=False)
def get_scalar():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title='Scalar API'
    )