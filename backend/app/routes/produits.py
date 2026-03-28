from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/produits", tags=["produits"])

class CreateProduit(BaseModel):
    nom: str
    stock_actuel: int = 0
    unite: str = "Bouteille(s)"
    prix_vente_defaut: int = 0
    prix_achat: int = 0
    seuil_alerte: int = 5
    couleur_icone: str = "#00A650"
    a_formule: bool = False
    qte_formule: int = 0
    prix_formule: int = 0
    categorie_boisson: str = "Alcool"

class UpdateProduit(BaseModel):
    uid: str
    nom: str | None = None
    stock_actuel: int | None = None
    unite: str | None = None
    prix_vente_defaut: int | None = None
    prix_achat: int | None = None
    seuil_alerte: int | None = None
    couleur_icone: str | None = None
    a_formule: bool | None = None
    qte_formule: int | None = None
    prix_formule: int | None = None
    categorie_boisson: str | None = None

class DeleteReq(BaseModel):
    uid: str

@router.post("/list")
async def list_produits(user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch(
        "SELECT uid, nom, stock_actuel, unite, prix_vente_defaut, prix_achat, seuil_alerte, "
        "couleur_icone, a_formule, qte_formule, prix_formule, categorie_boisson "
        "FROM produits WHERE user_uid=$1 AND actif=true ORDER BY nom", user_uid
    )
    return {"success": True, "produits": [dict(r) for r in rows]}

@router.post("/create")
async def create_produit(req: CreateProduit, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    uid = await pool.fetchval(
        """INSERT INTO produits (uid, user_uid, nom, stock_actuel, unite, prix_vente_defaut, prix_achat,
           seuil_alerte, couleur_icone, a_formule, qte_formule, prix_formule, categorie_boisson)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING uid""",
        user_uid, req.nom, req.stock_actuel, req.unite, req.prix_vente_defaut, req.prix_achat,
        req.seuil_alerte, req.couleur_icone, req.a_formule, req.qte_formule, req.prix_formule, req.categorie_boisson
    )
    return {"success": True, "uid": uid}

@router.put("/update")
async def update_produit(req: UpdateProduit, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    fields = {k: v for k, v in req.dict(exclude={"uid"}).items() if v is not None}
    if not fields:
        return {"success": False, "error": "Aucun champ à modifier"}
    sets = ", ".join(f"{k}=${i+2}" for i, k in enumerate(fields))
    values = [req.uid, *fields.values(), user_uid]
    await pool.execute(
        f"UPDATE produits SET {sets}, date_modification=NOW() WHERE uid=$1 AND user_uid=${len(values)}",
        *values
    )
    return {"success": True}

@router.delete("/delete")
async def delete_produit(req: DeleteReq, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    await pool.execute("DELETE FROM produits WHERE uid=$1 AND user_uid=$2", req.uid, user_uid)
    return {"success": True}
