from fastapi import Request, HTTPException
from .auth import decode_token
from .database import get_pool

async def get_current_user(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    user_uid = decode_token(token)
    if not user_uid:
        raise HTTPException(status_code=401, detail="Token invalide")
    return user_uid
