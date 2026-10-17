from typing import Generator, Optional, List
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_token_payload
from app.core.errors import InvalidCredentialsError, RoleNotAuthorizedError, EntityNotFoundError
from app.models.user import User


async def get_current_user(
    payload: dict = Depends(get_token_payload),
    db: AsyncSession = Depends(get_db)
) -> User:
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidCredentialsError("Token payload missing subject.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise EntityNotFoundError("User", "Authenticated user not found in database.")
    return user


def require_role(allowed_roles: List[str]):
    """
    Factory dependency checking if current user's role is in allowed_roles.
    Admins are always authorized.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "admin":
            return current_user
        if current_user.role not in allowed_roles:
            raise RoleNotAuthorizedError(
                f"Role '{current_user.role}' is not authorized for this operation. Allowed: {allowed_roles}"
            )
        return current_user
    return role_checker


# Convenient role-specific dependencies
get_current_farmer = require_role(["farmer"])
get_current_buyer = require_role(["buyer"])
get_current_fpo = require_role(["fpo"])
get_current_farmer_or_fpo = require_role(["farmer", "fpo"])
get_current_officer = require_role(["fpo", "admin", "officer"])
