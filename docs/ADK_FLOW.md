# ADK Agent Integration - Complete Flow

## Overview

This document explains the complete user flow from onboarding to receiving AI-powered career roadmap with college recommendations.

## Complete Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                    │
└──────────────────────────────────────────────────────────────────────────┘

1. USER ONBOARDING
   ↓
   POST /api/user/onboard
   Body: {
     "name": "Rahul Kumar",
     "email": "rahul@example.com",
     "entrance_exam": "EAMCET",
     "entrance_rank": 5000,
     "tenth_marks": 95.5,
     "twelfth_marks": 92.0,
     "interests": ["AI", "Machine Learning"],
     "preferred_cities": ["Hyderabad", "Warangal"],
     "budget": 10,
     "generate_roadmap": true  ← Auto-trigger ADK
   }
   
   ↓
   Response: {
     "status": "success",
     "user": { "id": 1, "name": "Rahul Kumar", ... },
     "roadmap_generation": {
       "scheduled": true,
       "check_status_endpoint": "/api/adk/my-roadmap/1"
     }
   }

2. ADK PROCESSES USER DATA (Background)
   ↓
   ┌─────────────────────────────────────────┐
   │  ADK Career Coordinator Agent           │
   │  - Reads user profile from database     │
   │  - Analyzes interests & academic data   │
   │  - Searches specializations             │
   │  - Finds matching colleges              │
   │  - Generates month-by-month roadmap     │
   └─────────────────────────────────────────┘
   
   ↓
   Database Save:
   - recommendations table (roadmap type)
   - recommendations table (college type × 5-10)
   - users.status → "complete"

3. USER GETS ROADMAP
   ↓
   GET /api/adk/my-roadmap/1
   
   ↓
   Response: {
     "status": "success",
     "user": { "id": 1, "name": "Rahul Kumar", "status": "complete" },
     "roadmap": {
       "target_specialization": "AI/ML",
       "career_path": "M.Tech → AI Engineer → Senior ML Engineer",
       "job_roles": ["AI Engineer", "ML Engineer", "Data Scientist"],
       "colleges": [
         {
           "name": "JNTU Hyderabad",
           "location": "Hyderabad",
           "specialization": "AI/ML",
           "estimated_fee": 45000,
           "reason": "Top-ranked with strong AI research"
         },
         ...
       ],
       "roadmap_phases": [
         {
           "phase": 1,
           "title": "Preparation Phase",
           "duration_months": 3,
           "activities": ["Python mastery", "Math fundamentals"],
           "milestones": ["Complete Python course", "Score 90+ in entrance"]
         },
         ...
       ],
       "timeline": {
         "preparation_months": 3,
         "mtech_duration_months": 24,
         "total_months": 30
       },
       "salary_projection": {
         "starting_lpa": 8,
         "year_3_lpa": 18,
         "year_5_lpa": 30
       }
     },
     "colleges": [...],  // Individual college records
     "colleges_count": 8
   }
```

## API Endpoints

### 1. User Onboarding (with auto-roadmap)

```bash
POST /api/user/onboard
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your@email.com",
  "phone": "9876543210",
  "location": "Hyderabad",
  "entrance_exam": "EAMCET",
  "entrance_rank": 5000,
  "tenth_marks": 95.5,
  "twelfth_marks": 92.0,
  "interests": ["AI", "Machine Learning"],
  "preferred_cities": ["Hyderabad", "Warangal"],
  "budget": 10,
  "generate_roadmap": true
}
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "Your Name",
    "email": "your@email.com",
    "status": "onboarded"
  },
  "roadmap_generation": {
    "scheduled": true,
    "message": "Roadmap generation started in background",
    "check_status_endpoint": "/api/adk/my-roadmap/1"
  }
}
```

### 2. Generate Roadmap Manually

```bash
POST /api/adk/generate-roadmap
Content-Type: application/json

{
  "user_id": 1,
  "force_regenerate": false
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Roadmap generated and saved",
  "from_cache": false,
  "roadmap": { ... },
  "colleges_count": 8,
  "generated_at": "2026-03-13T20:00:00"
}
```

### 3. Get User's Roadmap

```bash
GET /api/adk/my-roadmap/{user_id}
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "Your Name",
    "status": "complete"
  },
  "roadmap": { ... },
  "roadmap_generated_at": "2026-03-13T20:00:00",
  "colleges": [ ... ],
  "colleges_count": 8
}
```

### 4. Search Colleges

```bash
POST /api/adk/search-colleges
Content-Type: application/json

{
  "user_id": 1,
  "specialization": "AI/ML",
  "districts": ["Hyderabad", "Warangal"]
}
```

### 5. Chat with ADK Agent

```bash
POST /api/adk/chat
Content-Type: application/json

{
  "user_id": "1",
  "message": "What are the best colleges for AI in Hyderabad?",
  "agent_name": "eamcet"
}
```

## Database Schema

### Tables Used

**users**
- Stores user profile information
- `status` field tracks progress: `pending` → `onboarded` → `assessing` → `analyzed` → `complete`

**recommendations**
- Stores both career roadmaps and college recommendations
- `recommendation_type`: "roadmap" or "college"
- `data`: JSON blob with full details

## Frontend Integration Example

### React/Next.js Example

```typescript
// 1. Onboard user
const onboarding = async (formData: OnboardForm) => {
  const response = await fetch('/api/user/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      generate_roadmap: true  // Auto-generate
    })
  });
  
  const data = await response.json();
  
  // Show loading state while roadmap generates
  if (data.roadmap_generation.scheduled) {
    toast.success('Roadmap is being generated! Check back in a moment.');
    // Poll for roadmap completion
    pollForRoadmap(data.user.id);
  }
  
  return data;
};

// 2. Get roadmap
const getRoadmap = async (userId: number) => {
  const response = await fetch(`/api/adk/my-roadmap/${userId}`);
  const data = await response.json();
  
  if (data.status === 'success' && data.roadmap) {
    // Display roadmap UI
    displayRoadmap(data.roadmap);
    displayColleges(data.colleges);
  }
  
  return data;
};

// 3. Poll for roadmap completion
const pollForRoadmap = (userId: number) => {
  const interval = setInterval(async () => {
    const data = await getRoadmap(userId);
    
    if (data.roadmap) {
      clearInterval(interval);
      toast.success('Your personalized roadmap is ready!');
    }
  }, 3000);  // Check every 3 seconds
  
  // Stop polling after 2 minutes
  setTimeout(() => clearInterval(interval), 120000);
};
```

## Testing the Flow

### 1. Create Test User

```bash
curl -X POST http://localhost:8000/api/user/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$RANDOM'@example.com",
    "entrance_exam": "EAMCET",
    "entrance_rank": 5000,
    "tenth_marks": 95.5,
    "twelfth_marks": 92.0,
    "interests": ["AI", "Machine Learning"],
    "preferred_cities": ["Hyderabad"],
    "budget": 10,
    "generate_roadmap": true
  }'
```

### 2. Wait for ADK Processing (5-10 seconds)

### 3. Get Roadmap

```bash
curl http://localhost:8000/api/adk/my-roadmap/1 | python -m json.tool
```

## Error Handling

### User Not Found
```json
{
  "detail": "User with ID 999 not found"
}
```

### ADK Service Error
```json
{
  "detail": "Error generating roadmap: Failed to connect to ADK agent"
}
```

### Roadmap Not Yet Generated
```json
{
  "status": "success",
  "user": { ... },
  "roadmap": null,
  "roadmap_generated_at": null,
  "colleges": [],
  "colleges_count": 0
}
```

## Best Practices

1. **Always set `generate_roadmap: true`** during onboarding for best UX
2. **Show loading state** while roadmap generates (takes 5-15 seconds)
3. **Cache roadmaps** - they're stored in DB, so subsequent loads are instant
4. **Allow regeneration** with `force_regenerate: true` if user updates profile
5. **Display colleges separately** for better UI organization

## Next Steps

1. ✅ User onboarding with data storage
2. ✅ ADK integration for career analysis
3. ✅ College search via ADK
4. ✅ Save roadmap + colleges to database
5. ⏭️ Add assessment/quiz integration
6. ⏭️ Add roadmap progress tracking
7. ⏭️ Add college comparison UI
