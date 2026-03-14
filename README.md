# EAMCET Career Platform

AI-powered career counseling platform built with Google ADK.

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── db/           # Database models and connection
│   ├── routers/      # API endpoints
│   └── main.py       # FastAPI app
│
├── frontend/         # Vite + React frontend
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── lib/          # API utilities
│   │   ├── context/      # Session state
│   │   └── components/   # Shared UI
│
├── eamcet_agent/     # Google ADK Agents
│   ├── agents/       # Agent logic
│   └── tools/        # Tools for college search, etc.
│
└── docs/             # Detailed Documentation
```

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for setup instructions.

## Documentation

- [ADK Integration Flow](docs/ADK_FLOW.md) - How the AI agents work
- [Frontend Integration Guide](docs/FRONTEND_INTEGRATION_GUIDE.md) - Connecting React to ADK
- [Integration Complete](docs/INTEGRATION_COMPLETE.md) - Summary of changes
- [Codespaces Setup](docs/CODESPACES_SETUP.md) - Setting up the dev environment
- [System Analysis Report](docs/SYSTEM_ANALYSIS_REPORT.md) - Analysis of the system architecture

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, Google ADK
- **Frontend**: Vite, React 18, Tailwind CSS
- **AI**: Google Gemini (via ADK)
