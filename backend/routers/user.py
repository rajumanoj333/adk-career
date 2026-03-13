"""
User Router - Onboarding and profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from db.connection import get_db
from db.models import User, UserStatus


router = APIRouter()


# Pydantic schemas
class UserOnboard(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    tenth_marks: Optional[float] = None
    twelfth_marks: Optional[float] = None
    entrance_exam: Optional[str] = None
    entrance_rank: Optional[int] = None
    budget: Optional[int] = None
    preferred_cities: Optional[List[str]] = None
    interests: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    status: UserStatus
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    tenth_marks: Optional[float] = None
    twelfth_marks: Optional[float] = None
    entrance_exam: Optional[str] = None
    entrance_rank: Optional[int] = None
    budget: Optional[int] = None
    preferred_cities: Optional[List[str]] = None
    interests: Optional[List[str]] = None


@router.post("/onboard", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserOnboard, db: Session = Depends(get_db)):
    """Create a new user with onboarding data"""
    
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        location=user_data.location,
        tenth_marks=user_data.tenth_marks,
        twelfth_marks=user_data.twelfth_marks,
        entrance_exam=user_data.entrance_exam,
        entrance_rank=user_data.entrance_rank,
        budget=user_data.budget,
        preferred_cities=user_data.preferred_cities,
        interests=user_data.interests,
        status=UserStatus.ONBOARDED
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """Get user by email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_data: UserUpdate, 
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    for field, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return None
