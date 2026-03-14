# 🚀 Quick Start Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (Cloud SQL or local)
- Google API Key (for ADK)

---

## 1️⃣ Backend Setup

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Variables:**
```env
GOOGLE_API_KEY=your_google_api_key_here
DATABASE_URL=postgresql://postgres:password@host:5432/eamcet_db
DB_PASSWORD=your_cloud_sql_password
```

### Start Backend
```bash
# Make script executable
chmod +x start.sh

# Start server
./start.sh
```

**Expected Output:**
```
🚀 Starting EAMCET Career Backend...
✅ Database connection successful!
🌐 Starting FastAPI server on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Verify:** Visit `http://localhost:8000/docs` to see Swagger UI

---

## 2️⃣ Frontend Setup

### Install Dependencies
```bash
cd frontend
npm install
```

### Configure Environment
```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Verify:** Visit `http://localhost:3000`

---

## 3️⃣ Test Complete Flow

### Step 1: Create User
1. Visit `http://localhost:3000`
2. Click "Get Started"
3. Fill onboarding form:
   - Name: Test User
   - Email: test@example.com
   - 10th Marks: 85
   - 12th Marks: 80
   - Entrance Exam: EAMCET
   - Rank: 5000
   - Budget: 15
   - Select cities and interests
4. Submit → Note the user ID (e.g., `7`)

### Step 2: Complete Assessment
1. You'll be redirected to `/assessment?userId=7`
2. Answer all 15 questions (swipe cards)
3. Wait for analysis to run automatically
4. View personality profile

### Step 3: Generate Roadmap
1. On analysis page, click "Generate AI Roadmap"
2. You'll be redirected to `/roadmap?userId=7`
3. Click "Generate My Career Roadmap"
4. Wait 10-30 seconds for AI to generate
5. View complete roadmap with:
   - 3 phases (Preparation → M.Tech → Career)
   - Monthly breakdown
   - College recommendations
   - Salary progression chart

---

## 🧪 Database Verification

### Check User
```sql
SELECT id, name, email, status, created_at 
FROM users 
WHERE id = 7;
```

### Check Assessments
```sql
SELECT dimension, COUNT(*) as questions_answered
FROM assessments 
WHERE user_id = 7
GROUP BY dimension;
```

### Check Analysis
```sql
SELECT 
  personality_profile,
  riasec_scores,
  career_matches
FROM analysis 
WHERE user_id = 7;
```

### Check Roadmap
```sql
SELECT 
  recommendation_type,
  career_path,
  data->>'target_specialization' as specialization,
  data->>'total_duration_months' as duration,
  jsonb_array_length(data->'colleges') as college_count,
  created_at
FROM recommendations 
WHERE user_id = 7 
  AND recommendation_type = 'roadmap';
```

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Should be 3.10+

# Check database connection
psql -h host -U postgres -d eamcet_db

# Check .env file
cat .env
```

### Frontend won't start
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf .next
npm run dev

# Check .env.local
cat .env.local
```

### Roadmap not generating
1. Check backend logs for errors
2. Verify Google API key is valid
3. Check database has assessment data:
   ```sql
   SELECT COUNT(*) FROM assessments WHERE user_id = 7;
   ```
4. Verify ADK agent is initialized

### TypeScript errors
```bash
cd frontend
npx tsc --noEmit
```

---

## 📊 API Endpoints

### Test with curl

**Create User:**
```bash
curl -X POST http://localhost:8000/api/user/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "tenth_marks": 85,
    "twelfth_marks": 80,
    "entrance_exam": "EAMCET",
    "entrance_rank": 5000,
    "budget": 15,
    "preferred_cities": ["Hyderabad"],
    "interests": ["AI", "ML"]
  }'
```

**Get Assessment Questions:**
```bash
curl http://localhost:8000/api/assessment/questions
```

**Submit Assessment Answer:**
```bash
curl -X POST http://localhost:8000/api/assessment/answer \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 7,
    "question_id": 1,
    "answer": "agree"
  }'
```

**Run Analysis:**
```bash
curl -X POST http://localhost:8000/api/analysis/run \
  -H "Content-Type: application/json" \
  -d '{"user_id": 7}'
```

**Generate Roadmap:**
```bash
curl -X POST http://localhost:8000/api/adk/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 7,
    "force_regenerate": false
  }'
```

**Get Roadmap:**
```bash
curl http://localhost:8000/api/adk/my-roadmap/7
```

---

## 🎯 Expected Response Times

| Operation | Expected Time |
|-----------|--------------|
| User Onboarding | < 1 second |
| Submit Assessment | < 500ms |
| Run Analysis | < 2 seconds |
| Generate Roadmap | 10-30 seconds (AI processing) |
| Get Saved Roadmap | < 1 second |

---

## 📝 Sample Test Data

### User Profile
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "tenth_marks": 85,
  "twelfth_marks": 80,
  "entrance_exam": "EAMCET",
  "entrance_rank": 5000,
  "budget": 15,
  "preferred_cities": ["Hyderabad", "Warangal"],
  "interests": ["AI", "Machine Learning", "Programming"]
}
```

### Expected Personality Profile
```
Personality: Investigative + Realistic
RIASEC Scores:
- Realistic: 2.8
- Investigative: 2.9 (highest)
- Artistic: 1.5
- Social: 2.1
- Enterprising: 2.3
- Conventional: 2.0

Top Careers:
- AI Engineer (95%)
- Data Scientist (92%)
- Software Engineer (88%)
```

### Expected Roadmap
```json
{
  "target_specialization": "Artificial Intelligence",
  "career_path": "M.Tech → AI Engineer → Senior ML Engineer",
  "total_duration_months": 30,
  "phases": [
    {"phase": 1, "title": "Preparation", "duration_months": 3},
    {"phase": 2, "title": "M.Tech Studies", "duration_months": 24},
    {"phase": 3, "title": "Career Launch", "duration_months": 3}
  ],
  "colleges": [...],
  "salary_progression": {
    "M_Tech_start": 8,
    "Year_1": 12,
    "Year_5": 40
  }
}
```

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can create user via onboarding
- [ ] Can complete 15 assessment questions
- [ ] Analysis page shows personality profile
- [ ] Can generate AI roadmap
- [ ] Roadmap displays correctly with all sections
- [ ] College recommendations appear
- [ ] Salary chart renders
- [ ] Data saved in database

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs
# Check browser console (F12)
```

### Database Status
```sql
-- Check all tables
\dt

-- Count records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM assessments) as assessments,
  (SELECT COUNT(*) FROM analysis) as analysis,
  (SELECT COUNT(*) FROM recommendations) as recommendations;
```

### API Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "agents": {"adk": "ready"}
}
```

---

## 🎉 You're Ready!

If everything works:
- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000
- ✅ Database connected
- ✅ ADK agents initialized
- ✅ Can complete full user flow

**You're ready to test the complete career roadmap system!**

---

**Need more details?**
- See `SUMMARY.md` for integration overview
- See `INTEGRATION_COMPLETE.md` for technical details
- See `FRONTEND_INTEGRATION_GUIDE.md` for architecture
