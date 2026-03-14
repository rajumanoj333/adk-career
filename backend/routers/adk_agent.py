"""
ADK Agent Router - AI-powered career and college guidance with database integration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from db.connection import get_db
from db.models import User, Recommendation, UserStatus, Analysis
from services.adk_agent_service import get_adk_service, ADKAgentService


router = APIRouter()


# Request schemas
class CareerRoadmapRequest(BaseModel):
    user_id: int  # Database user ID
    force_regenerate: Optional[bool] = False


class CollegeSearchRequest(BaseModel):
    user_id: int
    specialization: Optional[str] = None
    districts: Optional[List[str]] = None


class ChatRequest(BaseModel):
    user_id: str
    message: str
    agent_name: Optional[str] = "eamcet"
    context: Optional[Dict[str, Any]] = None


class AgentResponse(BaseModel):
    status: str
    agent: str
    response: str
    session_id: Optional[str] = None
    roadmap: Optional[Dict[str, Any]] = None


@router.post("/generate-roadmap", response_model=Dict[str, Any])
async def generate_career_roadmap(
    request: CareerRoadmapRequest,
    db: Session = Depends(get_db),
    adk: ADKAgentService = Depends(get_adk_service)
):
    """
    Generate personalized career roadmap using ADK for a database user.

    Flow:
    1. Get user data from database
    2. Get assessment/analysis results
    3. Send to ADK career coordinator with full profile
    4. Parse roadmap + colleges from response
    5. Save to database
    6. Return complete roadmap
    """
    # Get user from database
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {request.user_id} not found"
        )

    # Check if roadmap already exists
    if not request.force_regenerate:
        existing = db.query(Recommendation).filter(
            Recommendation.user_id == user.id,
            Recommendation.recommendation_type == "roadmap"
        ).first()

        if existing:
            return {
                "status": "success",
                "message": "Roadmap retrieved from database",
                "from_cache": True,
                "roadmap": existing.data,
                "generated_at": existing.created_at.isoformat()
            }

    # Get analysis data (RIASEC assessment results)
    analysis_data = None
    analysis = db.query(Analysis).filter(Analysis.user_id == user.id).first()
    if analysis:
        analysis_data = {
            "personality_profile": analysis.personality_profile,
            "riasec_scores": analysis.riasec_scores,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "career_matches": analysis.career_matches
        }

    # Build user profile for ADK
    user_profile = {
        "name": user.name,
        "email": user.email,
        "entrance_exam": user.entrance_exam,
        "entrance_rank": user.entrance_rank,
        "tenth_marks": user.tenth_marks,
        "twelfth_marks": user.twelfth_marks,
        "interests": user.interests or [],
        "preferred_cities": user.preferred_cities or [],
        "budget": user.budget,
        "location": user.location
    }

    try:
        # Generate roadmap using ADK WITH ANALYSIS DATA
        result = await adk.generate_career_roadmap(
            user_id=str(user.id),
            user_profile=user_profile,
            analysis_data=analysis_data  # Pass RIASEC analysis
        )

        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Failed to generate roadmap")
            )

        roadmap_data = result.get("roadmap", {})

        # Save roadmap to database
        roadmap_rec = Recommendation(
            user_id=user.id,
            recommendation_type="roadmap",
            career_path=roadmap_data.get("target_specialization", "General"),
            data=roadmap_data,
            probability=85.0,
            seat_type="roadmap"
        )
        db.add(roadmap_rec)

        # Save college recommendations
        colleges = roadmap_data.get("colleges", [])
        for college_data in colleges[:5]:  # Top 5 colleges
            college_rec = Recommendation(
                user_id=user.id,
                recommendation_type="college",
                career_path=roadmap_data.get("target_specialization", "General"),
                college_name=college_data.get("name", "Unknown"),
                data=college_data,
                probability=75.0,
                seat_type="recommended"
            )
            db.add(college_rec)

        # Update user status
        user.status = UserStatus.COMPLETE
        db.commit()
        db.refresh(roadmap_rec)

        return {
            "status": "success",
            "message": "Roadmap generated and saved",
            "from_cache": False,
            "roadmap": roadmap_data,
            "colleges_count": len(colleges),
            "generated_at": roadmap_rec.created_at.isoformat()
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating roadmap: {str(e)}"
        )


@router.post("/search-colleges", response_model=Dict[str, Any])
async def search_colleges(
    request: CollegeSearchRequest,
    db: Session = Depends(get_db),
    adk: ADKAgentService = Depends(get_adk_service)
):
    """
    Search colleges using ADK based on user preferences.
    """
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {request.user_id} not found"
        )
    
    # Get specialization from user interests or default
    specialization = request.specialization
    if not specialization and user.interests:
        specialization = user.interests[0] if isinstance(user.interests, list) else user.interests
    specialization = specialization or "AI/ML"
    
    # Get districts from user preferences or default
    districts = request.districts
    if not districts and user.preferred_cities:
        districts = user.preferred_cities if isinstance(user.preferred_cities, list) else [user.preferred_cities]
    districts = districts or ["Hyderabad"]
    
    try:
        colleges = await adk.search_colleges_for_specialization(
            user_id=str(user.id),
            specialization=specialization,
            districts=districts
        )
        
        # Save to database
        for college_data in colleges[:10]:
            existing = db.query(Recommendation).filter(
                Recommendation.user_id == user.id,
                Recommendation.college_name == college_data.get("name", "")
            ).first()
            
            if not existing:
                college_rec = Recommendation(
                    user_id=user.id,
                    recommendation_type="college",
                    career_path=specialization,
                    college_name=college_data.get("name", "Unknown"),
                    data=college_data,
                    probability=70.0,
                    seat_type="search_result"
                )
                db.add(college_rec)
        
        db.commit()
        
        return {
            "status": "success",
            "specialization": specialization,
            "districts": districts,
            "colleges": colleges,
            "count": len(colleges)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching colleges: {str(e)}"
        )


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    request: ChatRequest,
    adk: ADKAgentService = Depends(get_adk_service)
):
    """Chat with ADK agents."""
    try:
        result = await adk.chat(
            user_id=request.user_id,
            message=request.message,
            agent_name=request.agent_name,
            context=request.context
        )
        
        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Failed to get response")
            )
        
        return AgentResponse(
            status=result["status"],
            agent=result["agent"],
            response=result["response"],
            session_id=result.get("session_id")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error chatting with agent: {str(e)}"
        )


@router.get("/my-roadmap/{user_id}", response_model=Dict[str, Any])
async def get_user_roadmap(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user's saved career roadmap and college recommendations.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Get roadmap
    roadmap = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.recommendation_type == "roadmap"
    ).first()
    
    # Get colleges
    colleges = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.recommendation_type == "college"
    ).all()
    
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "status": user.status.value
        },
        "roadmap": roadmap.data if roadmap else None,
        "roadmap_generated_at": roadmap.created_at.isoformat() if roadmap else None,
        "colleges": [
            {
                "id": c.id,
                "name": c.college_name,
                "career_path": c.career_path,
                "probability": c.probability,
                "data": c.data,
                "created_at": c.created_at.isoformat()
            }
            for c in colleges
        ],
        "colleges_count": len(colleges)
    }


@router.get("/agents")
async def list_agents():
    """List available ADK agents"""
    return {
        "agents": [
            {
                "name": "eamcet",
                "description": "M.Tech college search and information",
                "capabilities": ["college_search", "college_count", "career_guidance"]
            },
            {
                "name": "career_coordinator",
                "description": "Personalized career roadmap generator",
                "capabilities": ["career_planning", "specialization_search", "roadmap_generation"]
            }
        ]
    }
