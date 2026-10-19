from fastapi import APIRouter
from app.api.v1.endpoints import auth, farms, crops, assessments, lots, logistics, sync, ai

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(farms.router)
api_router.include_router(crops.router)
api_router.include_router(assessments.router)
api_router.include_router(lots.router)
api_router.include_router(logistics.router)
api_router.include_router(sync.router)
api_router.include_router(ai.router)

