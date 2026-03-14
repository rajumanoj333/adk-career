# Backend Setup Guide

## Prerequisites
- Python 3.12+
- PostgreSQL database (Google Cloud SQL)

## Database Setup

### 1. Google Cloud SQL Configuration

Your database details:
- **Host**: `34.27.117.60`
- **Port**: `5432`
- **Database**: `adk_career`
- **Connection Name**: `whatsapp-bot-482217:us-central1:eamcet-db`

### 2. Set Database Password

1. Go to Google Cloud Console → SQL → Instances
2. Select `eamcet-db` instance
3. Click on "Users" tab
4. Set/Reset password for `postgres` user

### 3. Update Environment Variables

Edit `.env` file with your actual credentials:

```bash
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@34.27.117.60:5432/adk_career
```

### 4. Create Database (if not exists)

Connect to your Cloud SQL instance:
```bash
# Using gcloud
gcloud sql connect eamcet-db --user=postgres

# Or using psql
psql "postgresql://postgres:YOUR_PASSWORD@34.27.117.60:5432/postgres"
```

Then create the database:
```sql
CREATE DATABASE adk_career;
```

## Installation

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

## Running the Server

```bash
# Development mode with auto-reload
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Or using Python
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### User Routes
- `POST /api/user/onboard` - Create user profile
- `GET /api/user/{user_id}` - Get user by ID
- `GET /api/user/by-email/{email}` - Get user by email
- `PATCH /api/user/{user_id}` - Update user
- `DELETE /api/user/{user_id}` - Delete user

### Assessment Routes
- `GET /api/assessment/questions` - Get all questions
- `GET /api/assessment/questions/{id}` - Get specific question
- `POST /api/assessment/answer` - Submit single answer
- `POST /api/assessment/batch` - Submit multiple answers
- `GET /api/assessment/user/{user_id}` - Get user's answers

### Analysis Routes
- `POST /api/analysis/run` - Run behavioral analysis
- `GET /api/analysis/{user_id}` - Get analysis results

### Roadmap Routes
- `GET /api/roadmap/` - List all roadmaps
- `GET /api/roadmap/{career}` - Get specific roadmap
- `POST /api/roadmap/generate` - Generate custom roadmap

### College Routes
- `GET /api/colleges/` - List colleges
- `GET /api/colleges/{id}` - Get college details
- `GET /api/colleges/recommend/user/{id}` - Get college recommendations
- `POST /api/colleges/check-eligibility` - Check eligibility

## Testing

Test the connection:
```bash
# Test root endpoint
curl http://localhost:8000/

# Test health endpoint
curl http://localhost:8000/health
```

## Troubleshooting

### Database Connection Error

If you see `password authentication failed`:
1. Verify your database password in `.env`
2. Check if the database exists
3. Ensure your IP is whitelisted in Cloud SQL

### Module Not Found

```bash
pip install -r requirements.txt
```

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── requirements.txt     # Python dependencies
├── agents/              # ADK behavior agents
│   ├── behavior_agent.py
│   ├── interest_agent.py
│   ├── career_agent.py
│   └── college_agent.py
├── db/                  # Database configuration
│   ├── connection.py
│   ├── models.py
│   └── seeds.py
└── routers/             # API route handlers
    ├── user.py
    ├── assessment.py
    ├── analysis.py
    ├── roadmap.py
    └── colleges.py
```
