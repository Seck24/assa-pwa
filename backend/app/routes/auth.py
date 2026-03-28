from fastapi import APIRouter, Response, Depends
from pydantic import BaseModel
from ..database import get_pool
from ..auth import verify_password, hash_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginReq(BaseModel):
    telephone: str
    mot_de_passe: str

class RegisterReq(BaseModel):
    telephone: str
    mot_de_passe: str
    nom_commerce: str
    ville_commune: str = ""
    nom_complet: str = ""
    code_commercial: str = ""

class ResetReq(BaseModel):
    telephone: str
    mot_de_passe: str

class CheckAccessReq(BaseModel):
    uid: str

@router.post("/login")
async def login(req: LoginReq, response: Response):
    pool = get_pool()
    row = await pool.fetchrow(
        "SELECT uid, telephone, nom_commerce, mot_de_passe FROM users WHERE telephone=$1",
        req.telephone
    )
    if not row or not verify_password(req.mot_de_passe, row["mot_de_passe"]):
        return {"success": False, "error": "Identifiants incorrects"}

    token = create_token(row["uid"])
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=30*24*3600, path="/")
    return {
        "success": True,
        "user_uid": row["uid"],
        "nom_commerce": row["nom_commerce"] or "",
        "telephone": row["telephone"],
    }

@router.post("/register")
async def register(req: RegisterReq, response: Response):
    pool = get_pool()
    existing = await pool.fetchval("SELECT uid FROM users WHERE telephone=$1", req.telephone)
    if existing:
        return {"success": False, "error": "Ce numéro est déjà utilisé"}

    hashed = hash_password(req.mot_de_passe)
    uid = await pool.fetchval(
        """INSERT INTO users (uid, telephone, mot_de_passe, nom_commerce, ville_commune, nom_complet, code_commercial)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6) RETURNING uid""",
        req.telephone, hashed, req.nom_commerce, req.ville_commune, req.nom_complet, req.code_commercial
    )
    token = create_token(uid)
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=30*24*3600, path="/")
    return {"success": True, "user_uid": uid, "nom_commerce": req.nom_commerce, "telephone": req.telephone}

@router.post("/reset-password")
async def reset_password(req: ResetReq):
    pool = get_pool()
    hashed = hash_password(req.mot_de_passe)
    result = await pool.execute("UPDATE users SET mot_de_passe=$1 WHERE telephone=$2", hashed, req.telephone)
    if result == "UPDATE 0":
        return {"success": False, "message": "Numéro non trouvé"}
    return {"success": True, "message": "Mot de passe mis à jour"}

@router.post("/check-access")
async def check_access(req: CheckAccessReq):
    pool = get_pool()
    row = await pool.fetchrow(
        "SELECT uid, statut_compte, essai_fin, telephone, nom_commerce FROM users WHERE uid=$1", req.uid
    )
    if not row:
        return {"success": False, "access_granted": False, "account_status": "not_found",
                "trial_remaining_days": 0, "message": "Utilisateur non trouvé"}

    status = row["statut_compte"]
    if status == "actif":
        return {"success": True, "access_granted": True, "account_status": "actif",
                "trial_remaining_days": None, "message": "Accès autorisé",
                "uid": row["uid"], "telephone": row["telephone"], "nom_commerce": row["nom_commerce"]}

    if status == "essai":
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        remaining = (row["essai_fin"] - now).days if row["essai_fin"] else 0
        granted = remaining >= 0
        return {"success": True, "access_granted": granted, "account_status": "essai",
                "trial_remaining_days": max(remaining, 0),
                "message": "Période d'essai" if granted else "Période d'essai expirée",
                "uid": row["uid"], "telephone": row["telephone"], "nom_commerce": row["nom_commerce"]}

    return {"success": True, "access_granted": False, "account_status": status,
            "trial_remaining_days": 0, "message": "Compte suspendu"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"success": True}
