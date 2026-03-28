from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/depenses", tags=["depenses"])

class CreateDepense(BaseModel):
    uid: str
    categorie: str
    description: str = ""
    montant: int
    date_depense: str

class ListDepenses(BaseModel):
    date_debut: str
    date_fin: str

@router.post("/create")
async def create_depense(req: CreateDepense, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute(
        "INSERT INTO depenses (uid, user_uid, categorie, description, montant, date_depense) VALUES ($1,$2,$3,$4,$5,$6::date)",
        req.uid, user_uid, req.categorie, req.description, req.montant, req.date_depense
    )
    return {"success": True}

@router.post("/list")
async def list_depenses(req: ListDepenses, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch(
        "SELECT uid, categorie, description, montant, date_depense::text FROM depenses "
        "WHERE user_uid=$1 AND date_depense >= $2::date AND date_depense <= $3::date ORDER BY date_depense DESC",
        user_uid, req.date_debut, req.date_fin
    )
    return {"success": True, "depenses": [dict(r) for r in rows]}
