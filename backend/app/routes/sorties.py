from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/sorties", tags=["sorties"])

class CreateSortie(BaseModel):
    uid: str
    produit_uid: str
    nom_produit: str
    serveur_uid: str
    nom_serveur: str
    quantite_sortie: int

class UpdateSortie(BaseModel):
    uid: str
    type: str  # "retour" | "encaissement"
    quantite: int

@router.post("/create")
async def create_sortie(req: CreateSortie, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute(
        """INSERT INTO sorties (uid, user_uid, produit_uid, nom_produit, serveur_uid, nom_serveur, quantite_sortie, quantite_retour, quantite_encaissee)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0)""",
        req.uid, user_uid, req.produit_uid, req.nom_produit, req.serveur_uid, req.nom_serveur, req.quantite_sortie
    )
    return {"success": True}

@router.put("/update")
async def update_sortie(req: UpdateSortie, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    if req.type == "retour":
        await pool.execute(
            "UPDATE sorties SET quantite_retour = COALESCE(quantite_retour, 0) + $1 WHERE uid=$2 AND user_uid=$3",
            req.quantite, req.uid, user_uid
        )
    elif req.type == "encaissement":
        await pool.execute(
            "UPDATE sorties SET quantite_encaissee = COALESCE(quantite_encaissee, 0) + $1 WHERE uid=$2 AND user_uid=$3",
            req.quantite, req.uid, user_uid
        )
    return {"success": True}

@router.delete("/clear")
async def clear_sorties(user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute("DELETE FROM sorties WHERE user_uid=$1", user_uid)
    return {"success": True}

@router.post("/list")
async def list_sorties(user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch(
        "SELECT uid, produit_uid, nom_produit, serveur_uid, nom_serveur, quantite_sortie, quantite_retour, quantite_encaissee "
        "FROM sorties WHERE user_uid=$1", user_uid
    )
    return {"success": True, "sorties": [dict(r) for r in rows]}
