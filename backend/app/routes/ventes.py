import math
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/ventes", tags=["ventes"])

class LignePanier(BaseModel):
    ref_produit_uid: str
    quantite: int
    mode_vente: str = "normal"  # "normal" | "formule"
    serveur_uid: str = ""
    nom_serveur: str = ""

class VenteBatchReq(BaseModel):
    session_uid: str
    serveur_uid: str = ""
    nom_serveur: str = ""
    lignes: list[LignePanier]

@router.post("/batch")
async def vente_batch(req: VenteBatchReq, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    count = 0

    async with pool.acquire() as conn:
        async with conn.transaction():
            for ligne in req.lignes:
                # 1. Chercher le produit
                product = await conn.fetchrow(
                    "SELECT nom, prix_vente_defaut, prix_achat, a_formule, qte_formule, prix_formule, stock_actuel "
                    "FROM produits WHERE uid=$1 AND user_uid=$2",
                    ligne.ref_produit_uid, user_uid
                )
                if not product:
                    continue

                # 2. Calculer prix, quantité encaissée, sous-total, marge
                srv_uid = ligne.serveur_uid or req.serveur_uid
                srv_nom = ligne.nom_serveur or req.nom_serveur

                if ligne.mode_vente == "formule" and product["a_formule"] and product["qte_formule"] > 0:
                    prix_unitaire = math.floor(product["prix_formule"] / product["qte_formule"])
                    qte_enc = ligne.quantite * product["qte_formule"]
                    sous_total = product["prix_formule"] * ligne.quantite
                else:
                    prix_unitaire = product["prix_vente_defaut"]
                    qte_enc = ligne.quantite
                    sous_total = prix_unitaire * ligne.quantite

                marge = sous_total - (product["prix_achat"] * qte_enc)

                # 3. Insérer la vente
                await conn.execute(
                    """INSERT INTO ventes (uid, user_uid, session_uid, ref_produit_uid, nom_affiche,
                       prix_unitaire, quantite, sous_total, marge, a_formule, serveur_uid, nom_serveur)
                       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)""",
                    user_uid, req.session_uid, ligne.ref_produit_uid, product["nom"],
                    prix_unitaire, ligne.quantite, sous_total, marge,
                    ligne.mode_vente == "formule", srv_uid, srv_nom
                )

                # 4. Décrémenter le stock
                await conn.execute(
                    "UPDATE produits SET stock_actuel = GREATEST(0, stock_actuel - $1), date_modification=NOW() "
                    "WHERE uid=$2 AND user_uid=$3",
                    qte_enc, ligne.ref_produit_uid, user_uid
                )

                # 5. Mettre à jour quantite_encaissee des sorties
                await conn.execute(
                    "UPDATE sorties SET quantite_encaissee = COALESCE(quantite_encaissee, 0) + $1 "
                    "WHERE user_uid=$2 AND produit_uid=$3 AND serveur_uid=$4",
                    ligne.quantite, user_uid, ligne.ref_produit_uid, srv_uid
                )

                count += 1

    return {"success": True, "count": count}
