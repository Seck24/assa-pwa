from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import create_pool, close_pool
from .routes import auth, produits, ventes, depenses, serveurs, sorties, rappels, rapport

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_pool()
    yield
    await close_pool()

app = FastAPI(title="ASSA API", lifespan=lifespan)

# Mount API routes
app.include_router(auth.router, prefix="/api")
app.include_router(produits.router, prefix="/api")
app.include_router(ventes.router, prefix="/api")
app.include_router(depenses.router, prefix="/api")
app.include_router(serveurs.router, prefix="/api")
app.include_router(sorties.router, prefix="/api")
app.include_router(rappels.router, prefix="/api")
app.include_router(rapport.router, prefix="/api")

# Serve React frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        file = FRONTEND_DIR / path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(FRONTEND_DIR / "index.html")
