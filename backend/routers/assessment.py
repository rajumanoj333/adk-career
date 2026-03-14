"""
Assessment Router - Behavioral assessment handling
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from db.connection import get_db
from db.models import User, Assessment, UserStatus


router = APIRouter()


# Sample assessment questions (RIASEC model)
ASSESSMENT_QUESTIONS = [
    {"id": 1, "text": "I enjoy solving complex logical problems", "dimension": "Investigative", "weight": 0.8},
    {"id": 2, "text": "I like working with tools and machinery", "dimension": "Realistic", "weight": 0.7},
    {"id": 3, "text": "I enjoy helping and teaching others", "dimension": "Social", "weight": 0.8},
    {"id": 4, "text": "I prefer creative activities like art or design", "dimension": "Artistic", "weight": 0.9},
    {"id": 5, "text": "I enjoy leading and organizing people", "dimension": "Enterprising", "weight": 0.7},
    {"id": 6, "text": "I like working with data and numbers", "dimension": "Conventional", "weight": 0.8},
    {"id": 7, "text": "I enjoy building and fixing things", "dimension": "Realistic", "weight": 0.8},
    {"id": 8, "text": "I like conducting research and experiments", "dimension": "Investigative", "weight": 0.9},
    {"id": 9, "text": "I enjoy performing in front of others", "dimension": "Enterprising", "weight": 0.6},
    {"id": 10, "text": "I prefer structured and organized work", "dimension": "Conventional", "weight": 0.7},
    {"id": 11, "text": "I enjoy coding and building software", "dimension": "Investigative", "weight": 0.9},
    {"id": 12, "text": "I like designing user interfaces", "dimension": "Artistic", "weight": 0.8},
    {"id": 13, "text": "I enjoy working in teams", "dimension": "Social", "weight": 0.7},
    {"id": 14, "text": "I like entrepreneurship and business", "dimension": "Enterprising", "weight": 0.8},
    {"id": 15, "text": "I enjoy analyzing data and finding patterns", "dimension": "Investigative", "weight": 0.9},
]


class AssessmentAnswer(BaseModel):
    question_id: int
    answer: str  # agree, neutral, disagree


class AssessmentAnswerBatch(BaseModel):
    user_id: int
    answers: List[AssessmentAnswer]


@router.get("/questions")
async def get_questions():
    """Get all assessment questions"""
    return {"questions": ASSESSMENT_QUESTIONS, "total": len(ASSESSMENT_QUESTIONS)}


@router.get("/questions/{question_id}")
async def get_question(question_id: int):
    """Get a specific question"""
    for q in ASSESSMENT_QUESTIONS:
        if q["id"] == question_id:
            return q
    raise HTTPException(status_code=404, detail="Question not found")


@router.post("/answer")
async def submit_answer(answer: AssessmentAnswer, db: Session = Depends(get_db)):
    """Submit a single assessment answer"""
    user = db.query(User).filter(User.id == answer.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    question = next((q for q in ASSESSMENT_QUESTIONS if q["id"] == answer.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if answer.answer not in ["agree", "neutral", "disagree"]:
        raise HTTPException(status_code=400, detail="Invalid answer")
    
    assessment = Assessment(
        user_id=answer.user_id,
        question_id=answer.question_id,
        dimension=question["dimension"],
        weight=question["weight"],
        answer=answer.answer
    )
    
    db.add(assessment)
    user.status = UserStatus.ASSESSING
    db.commit()
    
    return {"status": "saved", "question_id": answer.question_id}


@router.post("/batch")
async def submit_batch(batch: AssessmentAnswerBatch, db: Session = Depends(get_db)):
    """Submit multiple answers at once"""
    user = db.query(User).filter(User.id == batch.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    saved = []
    for answer in batch.answers:
        question = next((q for q in ASSESSMENT_QUESTIONS if q["id"] == answer.question_id), None)
        if question:
            assessment = Assessment(
                user_id=batch.user_id,
                question_id=answer.question_id,
                dimension=question["dimension"],
                weight=question["weight"],
                answer=answer.answer
            )
            db.add(assessment)
            saved.append(answer.question_id)

    db.commit()
    return {"status": "saved", "count": len(saved)}


@router.get("/user/{user_id}")
async def get_user_assessment(user_id: int, db: Session = Depends(get_db)):
    """Get all answers for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    assessments = db.query(Assessment).filter(Assessment.user_id == user_id).all()
    
    dimension_scores = {}
    for a in assessments:
        if a.dimension not in dimension_scores:
            dimension_scores[a.dimension] = {"total": 0, "count": 0}
        score = {"agree": 3, "neutral": 2, "disagree": 1}.get(a.answer, 2)
        dimension_scores[a.dimension]["total"] += score * a.weight
        dimension_scores[a.dimension]["count"] += 1
    
    for dim in dimension_scores:
        if dimension_scores[dim]["count"] > 0:
            dimension_scores[dim]["score"] = round(dimension_scores[dim]["total"] / dimension_scores[dim]["count"], 2)
    
    return {"user_id": user_id, "total_answers": len(assessments), "dimension_scores": dimension_scores}
