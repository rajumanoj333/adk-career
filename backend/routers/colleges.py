"""
Colleges Router - College recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict

from db.connection import get_db
from db.models import User, College


router = APIRouter()


# Sample college data (for demo - should come from database)
SAMPLE_COLLEGES = [
    {
        "id": 1,
        "name": "JNTU Hyderabad (Jawaharlal Nehru Technical University)",
        "code": "JNTUH",
        "university": "JNTU Hyderabad",
        "location": "Kukatpally, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME", "CE"],
        "closing_rank_general": 1500,
        "closing_rank_female": 2500,
        "management_seats": 180,
        "tuition_fee": 45000,
        "hostel_fee": 30000,
        "rating": 4.2,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 2,
        "name": "VNR Vignana Jyothi Institute of Engineering & Technology",
        "code": "VNRVJIET",
        "university": "JNTU Hyderabad",
        "location": "Bachupally, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME", "IT"],
        "closing_rank_general": 3500,
        "closing_rank_female": 5000,
        "management_seats": 240,
        "tuition_fee": 120000,
        "hostel_fee": 40000,
        "rating": 4.5,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 3,
        "name": "G Narayanamma Institute of Technology & Science",
        "code": "GNITS",
        "university": "JNTU Hyderabad",
        "location": "Shaikpet, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME"],
        "closing_rank_general": 5000,
        "closing_rank_female": 8000,
        "management_seats": 180,
        "tuition_fee": 100000,
        "hostel_fee": 35000,
        "rating": 4.3,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 4,
        "name": "Vasavi College of Engineering",
        "code": "VCE",
        "university": "Osmania University",
        "location": "Ibrahim Bagh, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME"],
        "closing_rank_general": 8000,
        "closing_rank_female": 12000,
        "management_seats": 180,
        "tuition_fee": 110000,
        "hostel_fee": 35000,
        "rating": 4.1,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 5,
        "name": "Chaitanya Bharathi Institute of Technology",
        "code": "CBIT",
        "university": "Osmania University",
        "location": "Gandipet, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME", "CE", "PE"],
        "closing_rank_general": 6000,
        "closing_rank_female": 9000,
        "management_seats": 300,
        "tuition_fee": 95000,
        "hostel_fee": 40000,
        "rating": 4.4,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 6,
        "name": "Mahatma Gandhi Institute of Technology",
        "code": "MGIT",
        "university": "JNTU Hyderabad",
        "location": "Gandipet, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME", "IT"],
        "closing_rank_general": 10000,
        "closing_rank_female": 15000,
        "management_seats": 240,
        "tuition_fee": 85000,
        "hostel_fee": 35000,
        "rating": 4.0,
        "is_autonomous": True,
        "NBA_accredited": True
    },
    {
        "id": 7,
        "name": "Institute of Aeronautical Engineering",
        "code": "IARE",
        "university": "JNTU Hyderabad",
        "location": "Dundigal, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "AE"],
        "closing_rank_general": 12000,
        "closing_rank_female": 18000,
        "management_seats": 180,
        "tuition_fee": 90000,
        "hostel_fee": 30000,
        "rating": 3.9,
        "is_autonomous": True,
        "NBA_accredited": False
    },
    {
        "id": 8,
        "name": "CVR College of Engineering",
        "code": "CVRCE",
        "university": "JNTU Hyderabad",
        "location": "Moula Ali, Hyderabad",
        "district": "Hyderabad",
        "city": "Hyderabad",
        "courses": ["CSE", "ECE", "EEE", "ME"],
        "closing_rank_general": 15000,
        "closing_rank_female": 22000,
        "management_seats": 180,
        "tuition_fee": 80000,
        "hostel_fee": 30000,
        "rating": 3.8,
        "is_autonomous": True,
        "NBA_accredited": False
    },
]


# Pydantic schemas
class CollegeResponse(BaseModel):
    id: int
    name: str
    code: str
    university: str
    location: str
    city: str
    courses: List[str]
    closing_rank_general: Optional[int]
    tuition_fee: int
    rating: float
    is_autonomous: bool
    NBA_accredited: bool


class CollegeRecommendation(BaseModel):
    college: CollegeResponse
    probability: float
    seat_type: str  # counseling, management


@router.get("/")
async def list_colleges(
    city: Optional[str] = Query(None, description="Filter by city"),
    course: Optional[str] = Query(None, description="Filter by course"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """List colleges with optional filters"""
    
    colleges = SAMPLE_COLLEGES
    
    # Apply filters
    if city:
        colleges = [c for c in colleges if city.lower() in c["city"].lower()]
    
    if course:
        colleges = [c for c in colleges if course.upper() in c["courses"]]
    
    return {
        "colleges": colleges[:limit],
        "count": len(colleges)
    }


@router.get("/{college_id}")
async def get_college(college_id: int):
    """Get details of a specific college"""
    
    for college in SAMPLE_COLLEGES:
        if college["id"] == college_id:
            return college
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="College not found"
    )


@router.get("/recommend/user/{user_id}")
async def recommend_colleges(
    user_id: int,
    course: Optional[str] = Query("CSE", description="Preferred course"),
    budget: Optional[int] = Query(10, description="Budget in lakhs"),
    db: Session = Depends(get_db)
):
    """Get college recommendations based on user profile"""
    
    # Get user data
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        # Use defaults if user not found
        user_rank = 10000
        user_budget = budget
    else:
        user_rank = user.entrance_rank or 10000
        user_budget = user.budget or budget
    
    # Filter colleges
    recommendations = []
    
    for college in SAMPLE_COLLEGES:
        # Check if course is available
        if course.upper() not in college["courses"]:
            continue
        
        # Check budget
        fee_lakhs = college["tuition_fee"] / 100000
        if fee_lakhs > user_budget:
            continue
        
        # Calculate probability
        if user_rank <= college["closing_rank_general"]:
            probability = min(95, 50 + (college["closing_rank_general"] - user_rank) / 100)
            seat_type = "counseling"
        elif user_rank <= college["closing_rank_female"]:
            probability = min(85, 40 + (college["closing_rank_female"] - user_rank) / 150)
            seat_type = "counseling (female)"
        elif user_rank <= college["closing_rank_general"] * 3:
            probability = min(75, 30 + (college["closing_rank_general"] * 3 - user_rank) / 200)
            seat_type = "management"
        else:
            continue
        
        recommendations.append({
            "college": college,
            "probability": round(probability, 1),
            "seat_type": seat_type
        })
    
    # Sort by probability
    recommendations.sort(key=lambda x: x["probability"], reverse=True)
    
    return {
        "user_id": user_id,
        "course": course,
        "rank": user_rank,
        "budget": budget,
        "recommendations": recommendations[:10],
        "count": len(recommendations)
    }


@router.post("/check-eligibility")
async def check_eligibility(
    rank: int,
    course: str,
    category: str = "general"
):
    """Check eligibility for colleges based on rank"""
    
    eligible = []
    
    for college in SAMPLE_COLLEGES:
        if course.upper() not in college["courses"]:
            continue
        
        if category == "general":
            closing_rank = college["closing_rank_general"]
        elif category == "female":
            closing_rank = college["closing_rank_female"]
        else:
            closing_rank = college["closing_rank_general"] * 2
        
        if rank <= closing_rank:
            eligible.append({
                "college": college,
                "eligible": True,
                "seat_type": "counseling"
            })
        elif rank <= closing_rank * 2:
            eligible.append({
                "college": college,
                "eligible": True,
                "seat_type": "management"
            })
    
    return {
        "rank": rank,
        "course": course,
        "category": category,
        "eligible_colleges": eligible,
        "count": len(eligible)
    }
