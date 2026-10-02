import logging
from typing import Dict, Any, List, Optional
import motor.motor_asyncio
from app.config import settings

logger = logging.getLogger("shadowwatch.db")

class InMemoryStore:
    """Fallback in-memory database store when MongoDB is unavailable."""
    def __init__(self):
        self.collections: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "logs": [],
            "profiles": [],
            "incidents": [],
            "risk_scores": [],
            "reports": [],
            "models": []
        }

    async def insert_one(self, collection_name: str, document: Dict[str, Any]):
        if collection_name not in self.collections:
            self.collections[collection_name] = []
        self.collections[collection_name].append(document)
        return True

    async def find(self, collection_name: str, query: Optional[Dict[str, Any]] = None, limit: int = 100) -> List[Dict[str, Any]]:
        items = self.collections.get(collection_name, [])
        if not query:
            return items[:limit]
        filtered = []
        for item in items:
            match = all(item.get(k) == v for k, v in query.items())
            if match:
                filtered.append(item)
        return filtered[:limit]

    async def find_one(self, collection_name: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = await self.find(collection_name, query, limit=1)
        return items[0] if items else None

    async def update_one(self, collection_name: str, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = True):
        existing = await self.find_one(collection_name, query)
        if existing:
            set_fields = update.get("$set", {})
            existing.update(set_fields)
        elif upsert:
            new_doc = {**query, **update.get("$set", {})}
            await self.insert_one(collection_name, new_doc)
        return True

class DatabaseManager:
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.db = None
        self.in_memory = InMemoryStore()
        self.use_mongo = False

    async def connect(self):
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=1500)
            await self.client.server_info()
            self.db = self.client[settings.MONGO_DB_NAME]
            self.use_mongo = True
            logger.info("Successfully connected to MongoDB at %s", settings.MONGO_URI)
        except Exception as e:
            self.use_mongo = False
            logger.warning("MongoDB unavailable (%s). Falling back to In-Memory Database Store.", e)

    async def close(self):
        if self.client and self.use_mongo:
            self.client.close()

db_manager = DatabaseManager()
