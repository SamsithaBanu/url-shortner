from datetime import datetime, timezone, timedelta
from uuid import uuid4
from backend.config import security_settings
import jwt

def generate_access_token(
    data: dict,
    expiry: timedelta = timedelta(days=10)
) -> str:
    payload = {
        **data,
        "jti": str(uuid4()),
        "exp": datetime.now(timezone.utc) + expiry,
    }
    return jwt.encode(
        payload=payload,
        key=security_settings.JWT_SECRET,
        algorithm=security_settings.JWT_ALGORITHM
    )

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            jwt=token,
            key=security_settings.JWT_SECRET,
            algorithms=[security_settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError:
        return None