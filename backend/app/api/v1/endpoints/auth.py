from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication & Access"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Public registration for Farmers, Buyers, and FPO Coordinators.
    Returns authenticated user profile and stateless JWT Bearer token.
    """
    return await AuthService.register(db, user_in)


@router.post("/login", response_model=TokenResponse)
async def login_user(creds: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user via mobile phone number and password.
    Returns user profile and JWT Bearer token.
    """
    return await AuthService.login(db, creds)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve currently authenticated user identity and role scopes.
    """
    return UserResponse.model_validate(current_user)
