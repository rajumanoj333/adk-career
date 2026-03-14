#!/bin/bash

# Backend Startup Script
# This script checks database connectivity before starting the server

set -e

echo "🚀 Starting EAMCET Career Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Copy .env.example to .env and update with your credentials"
    cp .env.example .env 2>/dev/null || true
    exit 1
fi

# Extract database URL
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env"
    exit 1
fi

echo "📊 Database URL: ${DATABASE_URL:0:30}..."

# Check database connection
echo "🔍 Testing database connection..."
python3 -c "
import sys
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', '')

try:
    from sqlalchemy import create_engine
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    print('✅ Database connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {str(e)[:100]}')
    print('📝 Please update DATABASE_URL in .env with correct credentials')
    sys.exit(1)
" || exit 1

# Start the server
echo "🌐 Starting FastAPI server on http://0.0.0.0:8000"
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
