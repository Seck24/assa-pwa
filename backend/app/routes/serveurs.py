from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/serveurs", tags=["serveurs"])

class CreateServeur(BaseModel):
    uid: str
    nom: str

class DeleteServeur(BaseModel):
    uid: str

@router.post("/list")
async def list_serveurs(user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch("SELECT uid, nom FROM serveurs WHERE user_uid=$1 ORDER BY nom", user_uid)
    return {"success": True, "serveurs": [dict(r) for r in rows]}

@router.post("/create")
async def create_serveur(req: CreateServeur, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute(
        "INSERT INTO serveurs (uid, user_uid, nom) VALUES ($1, $2, $3) ON CONFLICT (uid) DO NOTHING",
        req.uid, user_uid, req.nom
    )
    return {"success": True}

@router.delete("/delete")
async def delete_serveur(req: DeleteServeur, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    has_sorties = await pool.fetchval(
        "SELECT EXISTS(SELECT 1 FROM sorties WHERE serveur_uid=$1 AND user_uid=$2)", req.uid, user_uid
    )
    if has_sorties:
        return {"success": False, "error": "Impossible de supprimer : des sorties existent pour ce serveur"}
    await pool.execute("DELETE FROM serveurs WHERE uid=$1 AND user_uid=$2", req.uid, user_uid)
    return {"success": True}
