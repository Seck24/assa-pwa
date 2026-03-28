from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://n8n_user:Preo2026cool225ia@localhost:5432/assa_db"
    jwt_secret: str = "dev_secret_change_in_production"
    jwt_expire_hours: int = 720  # 30 jours

    class Config:
        env_file = ".env"

settings = Settings()
