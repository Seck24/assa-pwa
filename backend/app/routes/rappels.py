from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/rappels", tags=["rappels"])

class CreateRappel(BaseModel):
    uid: str
    titre: str
    date_limite: str

class DeleteRappel(BaseModel):
    uid: str

@router.post("/list")
async def list_rappels(user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch(
        "SELECT uid, titre, date_limite::text FROM rappels WHERE user_uid=$1 ORDER BY date_limite", user_uid
    )
    return {"success": True, "rappels": [dict(r) for r in rows]}

@router.post("/create")
async def create_rappel(req: CreateRappel, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute(
        "INSERT INTO rappels (uid, user_uid, titre, date_limite) VALUES ($1, $2, $3, $4::timestamptz)",
        req.uid, user_uid, req.titre, req.date_limite
    )
    return {"success": True}

@router.delete("/delete")
async def delete_rappel(req: DeleteRappel, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute("DELETE FROM rappels WHERE uid=$1 AND user_uid=$2", req.uid, user_uid)
    return {"success": True}
