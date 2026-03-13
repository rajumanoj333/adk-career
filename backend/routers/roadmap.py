"""
Roadmap Router - Career roadmap generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional

from db.connection import get_db


router = APIRouter()


# Career roadmaps
CAREER_ROADMAPS = {
    "AI Engineer": {
        "description": "Build AI/ML systems and intelligent applications",
        "stages": [
            {
                "stage": 1,
                "title": "Foundation",
                "duration": "3-6 months",
                "topics": [
                    "Python programming mastery",
                    "Data structures and algorithms",
                    "Linear algebra basics",
                    "Probability and statistics"
                ],
                "resources": [
                    "Python.org tutorials",
                    "LeetCode practice",
                    "Khan Academy Linear Algebra",
                    "StatQuest YouTube channel"
                ]
            },
            {
                "stage": 2,
                "title": "Machine Learning Basics",
                "duration": "4-6 months",
                "topics": [
                    "Supervised learning (Regression, Classification)",
                    "Unsupervised learning (Clustering, Dimensionality reduction)",
                    "Model evaluation and validation",
                    "Feature engineering"
                ],
                "resources": [
                    "Andrew Ng's ML Course",
                    "Scikit-learn documentation",
                    "Kaggle competitions"
                ]
            },
            {
                "stage": 3,
                "title": "Deep Learning",
                "duration": "4-6 months",
                "topics": [
                    "Neural networks fundamentals",
                    "TensorFlow or PyTorch",
                    "CNNs for computer vision",
                    "RNNs and Transformers for NLP"
                ],
                "resources": [
                    "DeepLearning.AI courses",
                    "Fast.ai",
                    "PyTorch tutorials"
                ]
            },
            {
                "stage": 4,
                "title": "Specialization & Projects",
                "duration": "6+ months",
                "projects": [
                    "Image classification with CNN",
                    "Sentiment analysis with BERT",
                    "Object detection system",
                    "Chatbot or recommendation engine"
                ],
                "skills": ["MLOps", "Cloud platforms", "Docker", "Git"]
            },
            {
                "stage": 5,
                "title": "Industry Preparation",
                "duration": "Ongoing",
                "actions": [
                    "Contribute to open source (TensorFlow, PyTorch)",
                    "Build strong GitHub portfolio",
                    "Prepare for ML engineering interviews",
                    "Network on LinkedIn",
                    "Apply to internships and entry positions"
                ]
            }
        ]
    },
    "Software Engineer": {
        "description": "Design and build software applications",
        "stages": [
            {
                "stage": 1,
                "title": "Programming Fundamentals",
                "duration": "3-6 months",
                "topics": [
                    "Choose a language (Python, Java, JavaScript)",
                    "Basic syntax and data types",
                    "Control flow and functions",
                    "Object-oriented programming"
                ]
            },
            {
                "stage": 2,
                "title": "Data Structures & Algorithms",
                "duration": "4-8 months",
                "topics": [
                    "Arrays, Linked Lists, Stacks, Queues",
                    "Trees and Graphs",
                    "Sorting and searching algorithms",
                    "Dynamic programming"
                ],
                "resources": ["LeetCode", "HackerRank", "CLRS book"]
            },
            {
                "stage": 3,
                "title": "Web Development",
                "duration": "4-6 months",
                "topics": [
                    "HTML, CSS, JavaScript",
                    "Frontend framework (React, Vue, Angular)",
                    "Backend (Node.js, Django, Spring)",
                    "Databases (SQL, NoSQL)",
                    "REST APIs"
                ]
            },
            {
                "stage": 4,
                "title": "Version Control & Collaboration",
                "duration": "1-2 months",
                "topics": [
                    "Git and GitHub",
                    "CI/CD pipelines",
                    "Agile/Scrum methodology",
                    "Code reviews"
                ]
            },
            {
                "stage": 5,
                "title": "Build Projects & Get Hired",
                "duration": "Ongoing",
                "projects": [
                    "Full-stack web app",
                    "Mobile app",
                    "API service",
                    "Open source contributions"
                ]
            }
        ]
    },
    "Data Scientist": {
        "description": "Extract insights from data",
        "stages": [
            {
                "stage": 1,
                "title": "Statistics & Math",
                "duration": "3-6 months",
                "topics": [
                    "Descriptive statistics",
                    "Probability distributions",
                    "Hypothesis testing",
                    "Linear algebra"
                ]
            },
            {
                "stage": 2,
                "title": "Python for Data Science",
                "duration": "3-4 months",
                "topics": [
                    "Python basics",
                    "NumPy, Pandas",
                    "Matplotlib, Seaborn",
                    "SQL for data analysis"
                ]
            },
            {
                "stage": 3,
                "title": "Machine Learning",
                "duration": "4-6 months",
                "topics": [
                    "Scikit-learn",
                    "Feature engineering",
                    "Model selection",
                    "Hyperparameter tuning"
                ]
            },
            {
                "stage": 4,
                "title": "Advanced Topics",
                "duration": "4-6 months",
                "topics": [
                    "Deep Learning basics",
                    "NLP",
                    "Time series analysis",
                    "A/B testing"
                ]
            },
            {
                "stage": 5,
                "title": "Portfolio & Career",
                "duration": "Ongoing",
                "projects": [
                    "Kaggle competitions",
                    "End-to-end data projects",
                    "Create blog/portfolio",
                    "Network in data community"
                ]
            }
        ]
    },
    "Web Developer": {
        "description": "Build websites and web applications",
        "stages": [
            {"stage": 1, "title": "HTML/CSS", "duration": "2-3 months"},
            {"stage": 2, "title": "JavaScript", "duration": "3-4 months"},
            {"stage": 3, "title": "Frontend Framework", "duration": "3-4 months"},
            {"stage": 4, "title": "Backend Basics", "duration": "3-4 months"},
            {"stage": 5, "title": "Projects & Deployment", "duration": "Ongoing"}
        ]
    },
    "DevOps Engineer": {
        "description": "Automate and manage infrastructure",
        "stages": [
            {"stage": 1, "title": "Linux & Networking", "duration": "3-4 months"},
            {"stage": 2, "title": "Scripting (Bash, Python)", "duration": "2-3 months"},
            {"stage": 3, "title": "Cloud Platforms (AWS/Azure/GCP)", "duration": "3-4 months"},
            {"stage": 4, "title": "Containers & Orchestration", "duration": "3-4 months"},
            {"stage": 5, "title": "CI/CD & Monitoring", "duration": "Ongoing"}
        ]
    },
    "Cybersecurity": {
        "description": "Protect systems and networks",
        "stages": [
            {"stage": 1, "title": "Networking Fundamentals", "duration": "3-4 months"},
            {"stage": 2, "title": "Linux & OS Concepts", "duration": "2-3 months"},
            {"stage": 3, "title": "Security Fundamentals", "duration": "3-4 months"},
            {"stage": 4, "title": "Penetration Testing", "duration": "4-6 months"},
            {"stage": 5, "title": "Certifications & Jobs", "duration": "Ongoing"}
        ]
    }
}


# Pydantic schemas
class RoadmapResponse(BaseModel):
    career: str
    description: str
    stages: List[Dict]


@router.get("/")
async def get_all_roadmaps():
    """Get list of all available roadmaps"""
    return {
        "careers": list(CAREER_ROADMAPS.keys()),
        "count": len(CAREER_ROADMAPS)
    }


@router.get("/{career}", response_model=RoadmapResponse)
async def get_roadmap(career: str):
    """Get roadmap for a specific career"""
    
    # Find matching career
    roadmap = CAREER_ROADMAPS.get(career)
    
    if not roadmap:
        # Try fuzzy match
        matches = [c for c in CAREER_ROADMAPS.keys() if career.lower() in c.lower()]
        if matches:
            roadmap = CAREER_ROADMAPS[matches[0]]
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Roadmap not found for '{career}'. Available: {list(CAREER_ROADMAPS.keys())}"
        )
    
    return RoadmapResponse(
        career=career,
        description=roadmap["description"],
        stages=roadmap["stages"]
    )


@router.post("/generate")
async def generate_custom_roadmap(
    career: str,
    current_level: Optional[str] = "beginner",
    target_role: Optional[str] = None
):
    """Generate a custom roadmap based on user's current level"""
    
    # Get base roadmap
    base = CAREER_ROADMAPS.get(career)
    
    if not base:
        return {
            "error": f"Career '{career}' not found",
            "available": list(CAREER_ROADMAPS.keys())
        }
    
    # Customize based on current level
    customized_stages = []
    
    if current_level == "beginner":
        customized_stages = base["stages"]
    elif current_level == "intermediate":
        # Skip foundation stages
        customized_stages = base["stages"][2:] if len(base["stages"]) > 2 else base["stages"]
    elif current_level == "advanced":
        # Focus on advanced topics only
        customized_stages = base["stages"][-2:] if len(base["stages"]) > 1 else base["stages"]
    
    return {
        "career": career,
        "current_level": current_level,
        "description": base["description"],
        "stages": customized_stages,
        "estimated_time": f"{len(customized_stages) * 4} months"
    }
