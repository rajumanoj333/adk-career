# Frontend-ADK Integration Guide

## Overview

This guide explains how the frontend integrates with Google ADK agents to generate personalized career roadmaps from database data.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vite React UI │────▶│  FastAPI Backend │────▶│  Google ADK     │────▶│  Cloud SQL      │
│   (React)       │◀────│  (Python)        │◀────│  Agents         │◀────│  PostgreSQL     │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │                        │                        │
       │                        │                        │                        │
       ▼                        ▼                        ▼                        ▼
  - Roadmap Page           - ADK Service            - eamcet_agent           - mtech_colleges
  - Onboarding             - User Router            - career_coordinator     - users
  - Assessment             - Roadmap Router         - Tools                  - recommendations
  - Dashboard              - Database               - Gemini 2.5 Flash       - assessments
```

## Data Flow: Roadmap Generation

### Step 1: User Completes Onboarding

**Frontend**: `/src/pages/OnboardingPage.tsx`
```typescript
// Collect user data
const userData = {
  name: "John Doe",
  email: "john@example.com",
  tenth_marks: 85,
  twelfth_marks: 80,
  entrance_exam: "EAMCET",
  entrance_rank: 5000,
  budget: 15,
  preferred_cities: ["Hyderabad", "Warangal"],
  interests: ["AI", "Machine Learning"]
};

// Send to backend
await axios.post('/api/user/onboard', userData);
// Returns: { id: 1, ... }
```

**Backend**: `/backend/routers/user.py`
```python
@router.post("/onboard")
async def onboard_user(user_data: UserCreate, db: Session):
    # Create user in database
    db_user = User(**user_data.dict())
    db.add(db_user)
    db.commit()
    return db_user
```

### Step 2: Frontend Requests Roadmap Generation

**Frontend**: `/src/pages/RoadmapPage.tsx`
```typescript
const generateRoadmap = async () => {
  const response = await axios.post('/api/adk/generate-roadmap', {
    user_id: userId,  // From onboarding
    force_regenerate: false
  });

  // Response contains complete roadmap
  setRoadmap(response.data.roadmap);
};
```

### Step 3: Backend Calls ADK Agent

**Backend**: `/backend/routers/adk_agent.py`
```python
@router.post("/generate-roadmap")
async def generate_career_roadmap(
    request: CareerRoadmapRequest,
    db: Session,
    adk: ADKAgentService
):
    # 1. Get user from database
    user = db.query(User).filter(User.id == request.user_id).first()

    # 2. Build user profile for ADK
    user_profile = {
        "name": user.name,
        "interests": user.interests,
        "preferred_cities": user.preferred_cities,
        "entrance_rank": user.entrance_rank,
        # ... more fields
    }

    # 3. Call ADK career coordinator
    result = await adk.generate_career_roadmap(
        user_id=str(user.id),
        user_profile=user_profile
    )

    # 4. Save roadmap to database
    roadmap_rec = Recommendation(
        user_id=user.id,
        recommendation_type="roadmap",
        data=result["roadmap"]
    )
    db.add(roadmap_rec)
    db.commit()

    return {"status": "success", "roadmap": result["roadmap"]}
```

### Step 4: ADK Agent Queries Database

**Backend**: `/backend/services/adk_agent_service.py`
```python
async def generate_career_roadmap(self, user_id: str, user_profile: dict):
    # Build comprehensive prompt
    prompt = self._build_career_prompt(user_profile)

    # Run career coordinator agent
    result = await self.run_agent("career_coordinator", user_id, prompt)

    # Parse roadmap response
    roadmap_data = self._parse_roadmap_response(result["response"])

    # Search colleges from database
    if "colleges" not in roadmap_data:
        colleges = await self.search_colleges_for_specialization(
            user_id,
            roadmap_data.get("target_specialization"),
            user_profile.get("preferred_cities")
        )
        roadmap_data["colleges"] = colleges

    return {"roadmap": roadmap_data}
```

### Step 5: ADK Tools Query Cloud SQL

**Backend**: `/eamcet_agent/tools/career_analysis.py`
```python
def get_colleges_for_specialization(specialization: str, district: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT "NAME", "DISTRICT", "COURSE", "INTAKE"
        FROM mtech_colleges
        WHERE LOWER("COURSE") LIKE %s
        ORDER BY "INTAKE" DESC
        LIMIT 15
    """

    cursor.execute(query, (f"%{specialization.lower()}%",))
    results = cursor.fetchall()

    return {"status": "success", "colleges": results}
```

### Step 6: Frontend Displays Roadmap

**Frontend**: `/src/pages/RoadmapPage.tsx`
```typescript
// Display phases
{roadmap.phases.map((phase) => (
  <PhaseCard
    key={phase.phase}
    phase={phase}
    isExpanded={expandedPhase === phase.phase}
  />
))}

// Display colleges
{roadmap.colleges.map((college, index) => (
  <CollegeCard college={college} rank={index + 1} />
))}

// Display salary progression
<SalaryChart data={roadmap.salary_progression} />
```

## Key Components

### 1. ADK Agent Service (`/backend/services/adk_agent_service.py`)

```python
class ADKAgentService:
    """Service wrapper for Google ADK agents"""

    async def initialize(self):
        # Initialize ADK runners
        self.runners["eamcet"] = Runner(
            app_name="eamcet",
            agent=eamcet_root_agent,
            session_service=self.session_service
        )

    async def generate_career_roadmap(self, user_id: str, user_profile: dict):
        # Build prompt from user profile
        prompt = self._build_career_prompt(user_profile)

        # Run career coordinator agent
        result = await self.run_agent("career_coordinator", user_id, prompt)

        # Parse and enrich with college data
        roadmap_data = self._parse_roadmap_response(result["response"])
        roadmap_data["colleges"] = await self.search_colleges(...)

        return {"roadmap": roadmap_data}
```

### 2. Career Coordinator Agent (`/eamcet_agent/agents/career_coordinator.py`)

```python
career_coordinator = Agent(
    model="gemini-2.5-flash",
    name="career_coordinator",
    instruction="You are an intelligent career advisor...",
    tools=[
        search_career_specializations,
        get_colleges_for_specialization,
        generate_college_to_career_roadmap,
        calculate_career_alignment_score
    ]
)
```

### 3. Roadmap Generator Tool (`/eamcet_agent/tools/career_roadmap.py`)

```python
def generate_college_to_career_roadmap(
    user_profile: Dict[str, Any],
    target_specialization: str,
    colleges: List[Dict[str, Any]],
    learning_speed: str = "moderate"
) -> Dict[str, Any]:
    """
    Generate comprehensive 3-phase roadmap:
    1. Preparation Phase
    2. M.Tech Studies
    3. Career Launch
    """

    return {
        "phases": [...],
        "milestones": [...],
        "college_recommendations": [...],
        "salary_progression": {...}
    }
```

## API Endpoints

### Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing Page | Hero section, features |
| `/onboarding` | Onboarding Form | User registration |
| `/assessment` | Assessment | RIASEC test |
| `/analysis` | Analysis | Personality results |
| `/roadmap` | Roadmap | AI career plan |
| `/colleges` | Colleges | College list |
| `/dashboard` | Dashboard | Overview |

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/onboard` | POST | Create user |
| `/api/adk/generate-roadmap` | POST | Generate roadmap |
| `/api/adk/my-roadmap/{user_id}` | GET | Get saved roadmap |
| `/api/adk/search-colleges` | POST | Search colleges |
| `/api/adk/chat` | POST | Chat with agent |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  location VARCHAR(100),
  tenth_marks FLOAT,
  twelfth_marks FLOAT,
  entrance_exam VARCHAR(50),
  entrance_rank INTEGER,
  budget INTEGER,
  preferred_cities JSON,
  interests JSON,
  status VARCHAR(50)
);
```

### Recommendations Table
```sql
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  recommendation_type VARCHAR(50),  -- 'roadmap', 'college'
  career_path VARCHAR(100),
  college_name VARCHAR(200),
  probability FLOAT,
  data JSON,  -- Full roadmap/college data
  created_at TIMESTAMP
);
```

### M.Tech Colleges Table (Cloud SQL)
```sql
CREATE TABLE mtech_colleges (
  NAME VARCHAR(255),
  ADDRESS VARCHAR(255),
  DISTRICT VARCHAR(100),
  COURSE VARCHAR(100),
  INTAKE INTEGER
);
```

## Environment Setup

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
```env
GOOGLE_API_KEY=your_google_api_key
DATABASE_URL=postgresql://postgres:password@host:5432/eamcet_db
DB_PASSWORD=your_cloud_sql_password
```

### EAMCET Agent (eamcet_agent/.env)
```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_gemini_api_key
DB_PASSWORD=your_cloud_sql_password
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
./start.sh
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Complete User Flow
1. Visit `http://localhost:5173`
2. Click "Get Started" → Complete onboarding
3. User ID is stored in frontend session state
4. Go to `/assessment` and complete all questions
5. Go to `/analysis`, then `/roadmap` and click "Generate roadmap"
6. View AI-generated roadmap with colleges

### 4. Verify Database
```sql
-- Check user
SELECT * FROM users WHERE id = 1;

-- Check roadmap
SELECT * FROM recommendations
WHERE user_id = 1 AND recommendation_type = 'roadmap';

-- Check colleges
SELECT * FROM recommendations
WHERE user_id = 1 AND recommendation_type = 'college';
```

## Error Handling

### Frontend
```typescript
try {
  const response = await axios.post('/api/adk/generate-roadmap', data);
  if (response.data.status === 'success') {
    setRoadmap(response.data.roadmap);
    toast.success('Roadmap generated!');
  }
} catch (error: any) {
  toast.error(error.response?.data?.detail || 'Failed to generate');
}
```

### Backend
```python
try:
  result = await adk.generate_career_roadmap(...)
  if result.get("status") == "error":
    raise HTTPException(status_code=500, detail=result["message"])
except Exception as e:
  db.rollback()
  raise HTTPException(status_code=500, detail=str(e))
```

## Performance Optimization

### 1. Caching
```python
# Check if roadmap already exists
existing = db.query(Recommendation).filter(
  Recommendation.user_id == user_id,
  Recommendation.recommendation_type == "roadmap"
).first()

if existing and not force_regenerate:
  return {"roadmap": existing.data, "from_cache": True}
```

### 2. Async Operations
```python
# Use async ADK methods
async for event in runner.run_async(
  user_id=user_id,
  session_id=session_id,
  new_message=user_message
):
  response_text += event.text
```

### 3. Database Indexes
```sql
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
```

## Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **Database Passwords**: Use secrets management
3. **CORS**: Configure allowed origins in backend
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Monitoring & Logging

### Backend Logging
```python
import logging

logging.info(f"Generating roadmap for user {user_id}")
logging.error(f"ADK agent error: {str(e)}")
```

### Frontend Analytics
```typescript
// Track roadmap generation
if (response.data.status === 'success') {
  analytics.track('Roadmap Generated', {
    userId: userId,
    specialization: roadmap.target_specialization
  });
}
```

## Troubleshooting

### Issue: Roadmap not generating
**Solution**: Check Google API key, verify ADK initialization

### Issue: Colleges not showing
**Solution**: Verify Cloud SQL connection, check database query

### Issue: CORS errors
**Solution**: Update `allow_origins` in backend CORS middleware

### Issue: Database connection failed
**Solution**: Check DATABASE_URL, verify Cloud SQL instance is running

## Future Enhancements

1. **Real-time Updates**: WebSocket for live roadmap updates
2. **Progress Tracking**: User can mark milestones as complete
3. **Mentor Matching**: Connect with alumni in target specialization
4. **Job Board**: Integration with job portals
5. **Mobile App**: React Native version

---

**Built with Google ADK Framework | Vite React | FastAPI | PostgreSQL**
