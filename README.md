# EAMCET Career Platform

AI-powered career counseling platform built with Google ADK.

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── agents/       # ADK Agents (Behavior, Interest, Career, College)
│   ├── db/           # Database models and connection
│   ├── routers/      # API endpoints
│   └── main.py       # FastAPI app
│
├── frontend/         # Next.js frontend
│   ├── app/         # App router pages
│   │   ├── onboarding/   # User registration
│   │   ├── assessment/  # Behavioral assessment
│   │   ├── analysis/    # Personality results
│   │   ├── roadmap/     # Career roadmap
│   │   └── colleges/    # College recommendations
│   └── lib/         # API utilities
│
└── README.md
```

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, Google ADK
- **Frontend**: Next.js 14, React, Tailwind CSS
