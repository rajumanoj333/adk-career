"""
Database Models - SQLAlchemy
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    ForeignKey, Text, JSON, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum


Base = declarative_base()


class UserStatus(str, enum.Enum):
    PENDING = "pending"
    ONBOARDED = "onboarded"
    ASSESSING = "assessing"
    ANALYZED = "analyzed"
    COMPLETE = "complete"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    location = Column(String(100))
    
    # Academic details
    tenth_marks = Column(Float)  # Percentage
    twelfth_marks = Column(Float)  # Percentage
    entrance_exam = Column(String(50))  # EAMCET, JEE, etc.
    entrance_rank = Column(Integer)
    
    # Preferences
    budget = Column(Integer)  # In lakhs
    preferred_cities = Column(JSON)  # List of cities
    interests = Column(JSON)  # List of interests
    
    # Status
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assessments = relationship("Assessment", back_populates="user")
    analysis = relationship("Analysis", back_populates="user", uselist=False)
    recommendations = relationship("Recommendation", back_populates="user")


class Assessment(Base):
    """Behavioral assessment responses"""
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Question details
    question_id = Column(Integer, nullable=False)
    dimension = Column(String(50))  # RIASEC dimension
    weight = Column(Float, default=1.0)
    
    # Answer (1-5 scale or swipe direction)
    answer = Column(String(20))  # agree, neutral, disagree
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="assessments")


class Analysis(Base):
    """Behavioral and interest analysis results"""
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Personality profile
    personality_profile = Column(String(100))  # e.g., "Investigative + Realistic"
    riasec_scores = Column(JSON)  # R, I, A, S, E, C scores
    
    # Traits
    strengths = Column(JSON)  # List of strengths
    weaknesses = Column(JSON)  # List of weaknesses
    
    # Career fits
    career_matches = Column(JSON)  # {career: score}
    
    # Raw analysis
    analysis_text = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="analysis")


class Recommendation(Base):
    """College and career recommendations"""
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Recommendation type
    recommendation_type = Column(String(50))  # college, career, roadmap
    
    # Data
    career_path = Column(String(100))
    college_name = Column(String(200))
    probability = Column(Float)  # Seat probability
    seat_type = Column(String(50))  # counseling, management, lateral
    
    # Full recommendation data
    data = Column(JSON)  # Full JSON blob
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="recommendations")


class College(Base):
    """College database"""
    __tablename__ = "colleges"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    name = Column(String(200), nullable=False)
    code = Column(String(20))  # College code
    university = Column(String(100))
    
    # Location
    location = Column(String(100))
    district = Column(String(50))
    city = Column(String(50))
    
    # Courses
    courses = Column(JSON)  # Available courses
    
    # Seat info (estimated)
    closing_rank_general = Column(Integer)
    closing_rank_female = Column(Integer)
    management_seats = Column(Integer)
    
    # Fees
    tuition_fee = Column(Integer)
    hostel_fee = Column(Integer)
    
    # Ratings
    rating = Column(Float)
    
    # Metadata
    is_autonomous = Column(Boolean, default=False)
    NBA_accredited = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
