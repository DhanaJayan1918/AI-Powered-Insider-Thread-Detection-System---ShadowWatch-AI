from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShadowWatch AI"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATASET_DIR: Path = BASE_DIR / "datasets"
    MODEL_DIR: Path = BASE_DIR / "models"
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "shadowwatch_db"
    
    # Gemini AI API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_NAME: str = "gemini-2.5-flash"
    
    # Isolation Forest Defaults
    CONTAMINATION: float = 0.05
    N_ESTIMATORS: int = 100
    RANDOM_STATE: int = 42

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
