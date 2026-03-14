# Backend API - EAMCET Career Platform

FastAPI backend integrated with Google ADK for AI-powered career counseling.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
./start.sh
# OR
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### User & Assessment
- `POST /api/user/onboard`: Create user profile.
- `POST /api/assessment/answer`: Submit assessment answer.
- `POST /api/analysis/run`: Run behavioral analysis.

### AI Agents (ADK)
- `POST /api/adk/generate-roadmap`: Generate personalized career roadmap.
- `GET /api/adk/my-roadmap/{user_id}`: Retrieve generated roadmap.
- `POST /api/adk/search-colleges`: Search for colleges.
- `POST /api/adk/chat`: Chat with career advisor agent.

## Environment Variables

Ensure your `.env` file contains:
- `GOOGLE_API_KEY`: For Gemini AI.
- `DATABASE_URL`: PostgreSQL connection string.
