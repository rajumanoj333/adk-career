# Backend API - EAMCET Career Platform

## Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
uvicorn main:app --reload
```

## API Endpoints
- `POST /user/onboard` - Create user profile
- `POST /assessment/answer` - Submit assessment answer
- `POST /analysis/run` - Run behavioral analysis
- `GET /colleges/recommend` - Get college recommendations
- `GET /roadmap/{career}` - Get career roadmap
