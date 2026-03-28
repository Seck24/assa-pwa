from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..deps import get_current_user

router = APIRouter(prefix="/rapport", tags=["rapport"])

class RapportReq(BaseModel):
    date_debut: str
    date_fin: str

@router.post("")
async def get_rapport(req: RapportReq, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    # Ventes agrégées par produit
    ventes_rows = await pool.fetch(
        """SELECT nom_affiche, SUM(quantite)::int AS quantite, SUM(sous_total)::int AS sous_total, SUM(marge)::int AS marge
           FROM ventes WHERE user_uid=$1 AND date_vente >= $2::timestamptz AND date_vente <= ($3::date + 1)::timestamptz
           GROUP BY nom_affiche ORDER BY nom_affiche""",
        user_uid, req.date_debut, req.date_fin
    )
    total_marge = sum(r["marge"] for r in ventes_rows)

    # Dépenses
    dep_rows = await pool.fetch(
        "SELECT uid, categorie, description, montant, date_depense::text FROM depenses "
        "WHERE user_uid=$1 AND date_depense >= $2::date AND date_depense <= $3::date",
        user_uid, req.date_debut, req.date_fin
    )
    total_depenses = sum(r["montant"] for r in dep_rows)

    return {
        "success": True,
        "total_marge": total_marge,
        "total_depenses": total_depenses,
        "benefice_net": total_marge - total_depenses,
        "ventes": [dict(r) for r in ventes_rows],
        "depenses": [dict(r) for r in dep_rows],
    }

@router.post("/stats-serveurs")
async def stats_serveurs(req: RapportReq, user_uid: str = Depends(get_current_user)):
    pool = get_pool()
    rows = await pool.fetch(
        """SELECT nom_serveur, COALESCE(SUM(sous_total), 0)::int AS ca_total, COUNT(*)::int AS nb_ventes
           FROM ventes WHERE user_uid=$1 AND date_vente >= $2::timestamptz AND date_vente <= ($3::date + 1)::timestamptz
           GROUP BY nom_serveur ORDER BY ca_total DESC""",
        user_uid, req.date_debut, req.date_fin
    )
    return {"success": True, "serveurs": [dict(r) for r in rows]}
