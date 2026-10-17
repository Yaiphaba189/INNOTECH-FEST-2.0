import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.errors import PhoneAlreadyRegisteredError, InvalidCredentialsError, EntityNotFoundError
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse


class AuthService:
    @staticmethod
    async def register(db: AsyncSession, user_in: UserCreate) -> TokenResponse:
        # Check if phone number already registered
        existing = await db.execute(select(User).where(User.phone_number == user_in.phone_number))
        if existing.scalars().first():
            raise PhoneAlreadyRegisteredError()

        user = User(
            id=str(uuid.uuid4()),
            phone_number=user_in.phone_number,
            full_name=user_in.full_name,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role.lower(),
            preferred_language=user_in.preferred_language,
            is_simulated=user_in.is_simulated,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    async def login(db: AsyncSession, creds: UserLogin) -> TokenResponse:
        result = await db.execute(select(User).where(User.phone_number == creds.phone_number))
        user = result.scalars().first()
        if not user or not verify_password(creds.password, user.password_hash):
            raise InvalidCredentialsError()

        token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> User:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise EntityNotFoundError("User", f"User ID '{user_id}' does not exist.")
        return user
