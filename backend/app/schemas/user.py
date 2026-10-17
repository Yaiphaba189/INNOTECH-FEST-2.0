from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class UserCreate(BaseModel):
    phone_number: str = Field(..., pattern=r"^[0-9+]{10,15}$", description="Mobile phone number")
    full_name: str = Field(..., min_length=2, max_length=150)
    password: str = Field(..., min_length=6)
    role: str = Field("farmer", description="Role: farmer, buyer, fpo, admin")
    preferred_language: str = Field("en", description="en, mn_bengali, mn_mayek")
    is_simulated: bool = False


class UserLogin(BaseModel):
    phone_number: str
    password: str


class UserResponse(BaseModel):
    id: str
    phone_number: str
    full_name: str
    role: str
    preferred_language: str
    is_simulated: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
