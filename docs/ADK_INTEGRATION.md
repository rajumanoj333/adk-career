# ADK Agent Integration Guide

## Overview

Your Google ADK agents from `/eamcet_agent/` are now integrated into the FastAPI backend.

## What Was Done

### 1. Created ADK Agent Service Layer
**File:** `backend/services/adk_agent_service.py`

A service wrapper that:
- Initializes Google ADK agents on startup
- Manages sessions for each user
- Provides async methods for agent interactions
- Supports two agents:
  - `eamcet`: College search and general queries
  - `career_coordinator`: Personalized career roadmaps

### 2. Created ADK Agent Router
**File:** `backend/routers/adk_agent.py`

New API endpoints:
- `POST /api/adk/career-roadmap` - Get personalized career roadmap
- `POST /api/adk/college-search` - Search M.Tech colleges
- `POST /api/adk/chat` - Chat with any ADK agent
- `GET /api/adk/agents` - List available agents

### 3. Updated Main Application
**File:** `backend/main.py`

- Replaced simple Python agents with ADK agent service
- Added async lifespan for proper initialization
- Included new ADK router

### 4. Fixed Import Structure
Updated `eamcet_agent/` package imports to work both standalone and when imported from backend.

## API Usage

### 1. Get Career Roadmap

```bash
curl -X POST http://localhost:8000/api/adk/career-roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "current_role": "Software Developer",
    "experience_years": 2,
    "skills": ["Python", "Machine Learning"],
    "interests": ["AI", "Deep Learning"],
    "preferred_location": "Hyderabad",
    "budget": 10,
    "learning_speed": "moderate"
  }'
```

### 2. Search Colleges

```bash
curl -X POST http://localhost:8000/api/adk/college-search \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "district": "Hyderabad",
    "course": "CSE"
  }'
```

### 3. Chat with Agent

```bash
curl -X POST http://localhost:8000/api/adk/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "Find M.Tech colleges in Hyderabad offering AI",
    "agent_name": "eamcet"
  }'
```

## Environment Setup

Make sure your `.env` file in `/eamcet_agent/.env` has:

```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_gemini_api_key_here
DB_PASSWORD=your_cloud_sql_password_here
```

## Starting the Server

```bash
cd /workspaces/adk-career/backend
./start.sh
# or
python -m uvicorn main:app --reload --port 8000
```

## Available Agents

### 1. EAMCET Agent
- **Purpose**: M.Tech college search and information
- **Capabilities**:
  - Search colleges by district
  - Count colleges
  - General career guidance

### 2. Career Coordinator
- **Purpose**: Personalized career roadmap generator
- **Capabilities**:
  - Career planning
  - Specialization search
  - Roadmap generation with phases and milestones
  - College recommendations

## Testing the Integration

1. Start the backend server
2. Visit `http://localhost:8000/docs` to see all endpoints
3. Test the `/api/adk/agents` endpoint to see available agents
4. Use the interactive Swagger UI to test other endpoints

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  /api/adk/*     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ADK Agent       │
│ Service         │
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌─────────┐ ┌──────────────┐
│  eamcet │ │  career_     │
│  agent  │ │  coordinator │
└─────────┘ └──────────────┘
```

## Next Steps

1. **Update Frontend**: Modify your frontend to call the new `/api/adk/*` endpoints
2. **Add Error Handling**: Handle cases where ADK agents might fail or timeout
3. **Add Caching**: Cache common queries to reduce API calls
4. **Monitor Usage**: Track which agents are used most frequently

## Troubleshooting

### Agent not initializing
- Check `GOOGLE_API_KEY` in `.env`
- Verify `google-adk` is installed: `pip list | grep google-adk`

### Database connection errors
- Check `DB_PASSWORD` in `.env`
- Verify Cloud SQL instance is accessible

### Import errors
- Make sure you're running from the `backend` directory
- Check that `eamcet_agent` folder exists at project root
