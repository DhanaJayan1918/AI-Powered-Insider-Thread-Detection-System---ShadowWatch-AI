import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.mongodb import db_manager
from app.api.router import router as api_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

logger = logging.getLogger("shadowwatch.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ShadowWatch AI Enterprise Platform Backend...")
    await db_manager.connect()
    yield
    logger.info("Shutting down ShadowWatch AI Backend resources...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.5.0-ENTERPRISE",
    description="ShadowWatch AI: Production User and Entity Behavior Analytics (UEBA) Platform",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": "2.5.0-ENTERPRISE",
        "status": "Operational",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
