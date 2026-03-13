"""
Analysis Router - Behavioral analysis using ADK agents
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict

from db.connection import get_db
from db.models import User, Assessment, Analysis, UserStatus


router = APIRouter()


# Pydantic schemas
class AnalysisRequest(BaseModel):
    user_id: int


class AnalysisResponse(BaseModel):
    user_id: int
    personality_profile: str
    riasec_scores: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    career_matches: Dict[str, float]
    analysis_text: str


# RIASEC dimensions
RIASEC_DIMENSIONS = {
    "Realistic": ["practical", "hands-on", "physical", "problem-solver"],
    "Investigative": ["analytical", "scientific", "curious", "researcher"],
    "Artistic": ["creative", "imaginative", "artistic", "expressive"],
    "Social": ["helpful", "cooperative", "teaching", "supportive"],
    "Enterprising": ["leadership", "persuasive", "competitive", "ambitious"],
    "Conventional": ["organized", "detail-oriented", "systematic", "efficient"]
}

# Career mappings
CAREER_MAPPINGS = {
    "AI Engineer": {"dimensions": ["Investigative", "Realistic"], "skills": ["Python", "ML", "Data"]},
    "Software Engineer": {"dimensions": ["Investigative", "Conventional"], "skills": ["Programming", "Algorithms"]},
    "Data Scientist": {"dimensions": ["Investigative", "Conventional"], "skills": ["Statistics", "Python", "ML"]},
    "Web Developer": {"dimensions": ["Investigative", "Artistic"], "skills": ["HTML", "CSS", "JavaScript"]},
    "DevOps Engineer": {"dimensions": ["Realistic", "Conventional"], "skills": ["Cloud", "Automation"]},
    "Cybersecurity": {"dimensions": ["Investigative", "Conventional"], "skills": ["Security", "Networking"]},
    "Cloud Engineer": {"dimensions": ["Investigative", "Conventional"], "skills": ["Cloud", "Architecture"]},
    "Product Manager": {"dimensions": ["Enterprising", "Social"], "skills": ["Leadership", "Strategy"]},
    "UI/UX Designer": {"dimensions": ["Artistic", "Social"], "skills": ["Design", "User Research"]},
    "Full Stack Developer": {"dimensions": ["Investigative", "Realistic"], "skills": ["Frontend", "Backend"]},
}


def calculate_riasec_scores(assessments: List[Assessment]) -> Dict[str, float]:
    """Calculate RIASEC dimension scores from assessments"""
    scores = {dim: {"total": 0, "count": 0} for dim in RIASEC_DIMENSIONS.keys()}
    
    for a in assessments:
        if a.dimension in scores:
            # Score: agree=3, neutral=2, disagree=1
            score = {"agree": 3, "neutral": 2, "disagree": 1}.get(a.answer, 2)
            scores[a.dimension]["total"] += score * a.weight
            scores[a.dimension]["count"] += 1
    
    # Calculate averages
    result = {}
    for dim, data in scores.items():
        if data["count"] > 0:
            result[dim] = round(data["total"] / data["count"], 2)
        else:
            result[dim] = 0.0
    
    return result


def determine_personality_profile(riasec_scores: Dict[str, float]) -> str:
    """Determine personality profile from RIASEC scores"""
    # Sort by score descending
    sorted_dims = sorted(riasec_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Get top two dimensions
    top_dims = [dim for dim, score in sorted_dims[:2] if score >= 2.0]
    
    if not top_dims:
        return "Conventional"
    
    return " + ".join(top_dims)


def calculate_career_matches(riasec_scores: Dict[str, float]) -> Dict[str, float]:
    """Calculate career compatibility scores"""
    matches = {}
    
    for career, info in CAREER_MAPPINGS.items():
        dims = info["dimensions"]
        if len(dims) >= 2:
            # Score based on top dimensions matching
            score = 0
            for dim in dims:
                score += riasec_scores.get(dim, 0)
            # Normalize to 0-100
            matches[career] = round((score / 6) * 100, 1)
        elif len(dims) == 1:
            matches[career] = round((riasec_scores.get(dims[0], 0) / 3) * 100, 1)
    
    # Sort by score
    return dict(sorted(matches.items(), key=lambda x: x[1], reverse=True))


def determine_strengths_weaknesses(riasec_scores: Dict[str, float]) -> tuple:
    """Determine strengths and weaknesses from scores"""
    sorted_dims = sorted(riasec_scores.items(), key=lambda x: x[1], reverse=True)
    
    strengths = []
    weaknesses = []
    
    for dim, score in sorted_dims[:3]:
        if score >= 2.5:
            strengths.extend(RIASEC_DIMENSIONS[dim][:2])
    
    for dim, score in sorted_dims[-2:]:
        if score <= 1.5:
            weaknesses.extend(RIASEC_DIMENSIONS[dim][:1])
    
    return strengths[:5], list(set(weaknesses))[:3]


@router.post("/run", response_model=AnalysisResponse)
async def run_analysis(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Run behavioral analysis for a user"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user assessments
    assessments = db.query(Assessment).filter(
        Assessment.user_id == request.user_id
    ).all()
    
    if not assessments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No assessment data found. Please complete the assessment first."
        )
    
    # Calculate RIASEC scores
    riasec_scores = calculate_riasec_scores(assessments)
    
    # Determine personality profile
    personality_profile = determine_personality_profile(riasec_scores)
    
    # Calculate career matches
    career_matches = calculate_career_matches(riasec_scores)
    
    # Determine strengths and weaknesses
    strengths, weaknesses = determine_strengths_weaknesses(riasec_scores)
    
    # Generate analysis text
    top_careers = list(career_matches.items())[:3]
    analysis_text = (
        f"Based on your assessment, you have a {personality_profile} personality profile. "
        f"Your strongest traits include {', '.join(strengths)}. "
        f"Your top career matches are: {', '.join([f'{c} ({s}%)' for c, s in top_careers])}."
    )
    
    # Check if analysis already exists
    existing = db.query(Analysis).filter(
        Analysis.user_id == request.user_id
    ).first()
    
    if existing:
        # Update existing
        existing.personality_profile = personality_profile
        existing.riasec_scores = riasec_scores
        existing.strengths = strengths
        existing.weaknesses = weaknesses
        existing.career_matches = career_matches
        existing.analysis_text = analysis_text
        analysis = existing
    else:
        # Create new
        analysis = Analysis(
            user_id=request.user_id,
            personality_profile=personality_profile,
            riasec_scores=riasec_scores,
            strengths=strengths,
            weaknesses=weaknesses,
            career_matches=career_matches,
            analysis_text=analysis_text
        )
        db.add(analysis)
    
    # Update user status
    user.status = UserStatus.ANALYZED
    db.commit()
    db.refresh(analysis)
    
    return AnalysisResponse(
        user_id=request.user_id,
        personality_profile=personality_profile,
        riasec_scores=riasec_scores,
        strengths=strengths,
        weaknesses=weaknesses,
        career_matches=career_matches,
        analysis_text=analysis_text
    )


@router.get("/{user_id}", response_model=AnalysisResponse)
async def get_analysis(user_id: int, db: Session = Depends(get_db)):
    """Get analysis for a user"""
    
    analysis = db.query(Analysis).filter(
        Analysis.user_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found. Run analysis first."
        )
    
    return AnalysisResponse(
        user_id=analysis.user_id,
        personality_profile=analysis.personality_profile,
        riasec_scores=analysis.riasec_scores,
        strengths=analysis.strengths,
        weaknesses=analysis.weaknesses,
        career_matches=analysis.career_matches,
        analysis_text=analysis.analysis_text
    )
