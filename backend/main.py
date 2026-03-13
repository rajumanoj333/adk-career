"""
FastAPI Backend - EAMCET Career Platform
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import user, assessment, analysis, roadmap, colleges
from db.connection import init_db
from agents.behavior_agent import BehaviorAgent
from agents.interest_agent import InterestAgent
from agents.career_agent import CareerAgent
from agents.college_agent import CollegeAgent


# Initialize agents
agents = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize on startup, cleanup on shutdown"""
    # Initialize database
    init_db()
    
    # Initialize ADK agents
    agents["behavior"] = BehaviorAgent()
    agents["interest"] = InterestAgent()
    agents["career"] = CareerAgent()
    agents["college"] = CollegeAgent()
    
    print("✅ All agents initialized")
    yield
    print("🧹 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="EAMCET Career Platform API",
    description="AI-powered career counseling platform with Google ADK",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(assessment.router, prefix="/assessment", tags=["Assessment"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
app.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "EAMCET Career Platform API",
        "version": "1.0.0",
        "agents": list(agents.keys())
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "agents": {name: "ready" for name in agents.keys()}
    }
