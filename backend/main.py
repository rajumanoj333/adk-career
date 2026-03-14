"""
FastAPI Backend - EAMCET Career Platform
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routers import user, assessment, analysis, roadmap, colleges, adk_agent
from db.connection import init_db
from services.adk_agent_service import get_adk_service, adk_service


# Initialize agents
agents = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize on startup, cleanup on shutdown"""
    # Initialize database
    init_db()

    # Initialize ADK agents
    await get_adk_service()
    agents["adk"] = adk_service

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

# CORS middleware - Allow local dev and GitHub Codespaces origins
default_cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]

codespace_name = os.getenv("CODESPACE_NAME")
codespaces_domain = os.getenv("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev")
if codespace_name:
    for port in ("3000", "4173", "5173", "8000"):
        default_cors_origins.append(f"https://{codespace_name}-{port}.{codespaces_domain}")

extra_cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "").split(",")
    if origin.strip()
]

allowed_origins = list(dict.fromkeys(default_cors_origins + extra_cors_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://[a-z0-9-]+-\d+\.(app\.github\.dev|githubpreview\.dev)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(colleges.router, prefix="/api/colleges", tags=["Colleges"])
app.include_router(adk_agent.router, prefix="/api/adk", tags=["ADK Agents"])


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
