# EAMCET Career Platform - GitHub Codespaces Setup

## Your Configuration

### Backend (FastAPI)
- **URL**: https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev
- **Port**: 8000

### Frontend (Next.js)
- **URL**: https://effective-space-spoon-g4q77v7jpgwghx5j-3000.app.github.dev
- **Port**: 3000

### Database (Google Cloud SQL)
- **Instance**: whatsapp-bot-482217:us-central1:eamcet-db
- **Public IP**: 34.27.117.60
- **Port**: 5432
- **Database**: adk_career

## Quick Start

### 1. Start Backend

```bash
cd /workspaces/adk-career/backend

# Make sure virtual environment is activated
source venv/bin/activate

# Start the server
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend (in a new terminal)

```bash
cd /workspaces/adk-career/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: Click on the GitHub Codespaces preview for port 3000
- **Backend API**: https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev

## Database Connection

### Test Database Connection

```bash
cd /workspaces/adk-career/backend
python3 -c "
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', '')

try:
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    print('✅ Database connected successfully!')
    conn.close()
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

### If Connection Fails

1. **Check Password**: Update `.env` with correct PostgreSQL password
2. **Check Firewall**: Ensure Google Cloud SQL allows connections from your IP
3. **Check Database Exists**: Create database if needed

```bash
# Connect to Cloud SQL
psql "postgresql://postgres:YOUR_PASSWORD@34.27.117.60:5432/postgres"

# Create database
CREATE DATABASE adk_career;
```

## Environment Variables

### Backend (.env)
```bash
GOOGLE_API_KEY=your_google_api_key_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@34.27.117.60:5432/adk_career
SQL_ECHO=false
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev
```

## Testing API Endpoints

```bash
# Root endpoint
curl https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev/

# Health check
curl https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev/health

# Get assessment questions
curl https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev/assessment/questions

# List colleges
curl https://effective-space-spoon-g4q77v7jpgwghx5j-8000.app.github.dev/colleges/
```

## Troubleshooting

### Backend Won't Start

```bash
# Check if port is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Install dependencies
pip install -r requirements.txt
```

### Frontend Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Error

1. Verify password in `.env`
2. Check Google Cloud SQL authorized networks
3. Ensure database `adk_career` exists

### CORS Error

Make sure backend CORS settings include your Codespaces URL in `backend/main.py`

## Ports in GitHub Codespaces

GitHub Codespaces automatically forwards these ports:
- **3000**: Next.js Frontend
- **8000**: FastAPI Backend
- **5432**: PostgreSQL (if running locally)

Click on the "Ports" tab in Codespaces to access the preview URLs.
