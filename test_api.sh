#!/bin/bash

# ADK Career Platform - API Test Script
# Tests the complete user flow from onboarding to roadmap generation

set -e

BASE_URL="http://localhost:8000"
USER_ID=""
USER_EMAIL="test_$(date +%s)@example.com"

echo "========================================"
echo "ADK Career Platform - API Test Suite"
echo "========================================"
echo "Base URL: $BASE_URL"
echo "Test Email: $USER_EMAIL"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test 1: Health Check
echo "========================================"
echo "TEST 1: Health Check"
echo "========================================"
print_status "Checking if server is running..."

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HEALTH_CODE" = "200" ]; then
    print_success "Server is healthy (HTTP $HEALTH_CODE)"
    echo "$HEALTH_BODY" | python -m json.tool 2>/dev/null || echo "$HEALTH_BODY"
else
    print_error "Server health check failed (HTTP $HEALTH_CODE)"
    exit 1
fi
echo ""

# Test 2: User Onboarding
echo "========================================"
echo "TEST 2: User Onboarding"
echo "========================================"
print_status "Creating new user with auto-roadmap generation..."

ONBOARD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/user/onboard" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Rahul Kumar\",
        \"email\": \"$USER_EMAIL\",
        \"phone\": \"9876543210\",
        \"location\": \"Hyderabad\",
        \"tenth_marks\": 95.5,
        \"twelfth_marks\": 92.0,
        \"entrance_exam\": \"EAMCET\",
        \"entrance_rank\": 5000,
        \"budget\": 10,
        \"preferred_cities\": [\"Hyderabad\", \"Warangal\"],
        \"interests\": [\"AI\", \"Machine Learning\", \"Data Science\"],
        \"generate_roadmap\": true
    }")

ONBOARD_CODE=$(echo "$ONBOARD_RESPONSE" | tail -n1)
ONBOARD_BODY=$(echo "$ONBOARD_RESPONSE" | head -n-1)

if [ "$ONBOARD_CODE" = "201" ]; then
    print_success "User created successfully (HTTP $ONBOARD_CODE)"
    USER_ID=$(echo "$ONBOARD_BODY" | python -c "import sys, json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null || echo "")
    echo "$ONBOARD_BODY" | python -m json.tool 2>/dev/null || echo "$ONBOARD_BODY"
    echo ""
    print_status "Extracted User ID: $USER_ID"
else
    print_error "User onboarding failed (HTTP $ONBOARD_CODE)"
    echo "$ONBOARD_BODY" | python -m json.tool 2>/dev/null || echo "$ONBOARD_BODY"
    exit 1
fi
echo ""

# Test 3: Get Assessment Questions
echo "========================================"
echo "TEST 3: Get Assessment Questions"
echo "========================================"
print_status "Fetching RIASEC assessment questions..."

QUESTIONS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/assessment/questions")
QUESTIONS_CODE=$(echo "$QUESTIONS_RESPONSE" | tail -n1)
QUESTIONS_BODY=$(echo "$QUESTIONS_RESPONSE" | head -n-1)

if [ "$QUESTIONS_CODE" = "200" ]; then
    print_success "Questions retrieved (HTTP $QUESTIONS_CODE)"
    echo "$QUESTIONS_BODY" | python -m json.tool 2>/dev/null || echo "$QUESTIONS_BODY"
else
    print_error "Failed to get questions (HTTP $QUESTIONS_CODE)"
fi
echo ""

# Test 4: Submit Assessment Answers (Batch)
echo "========================================"
echo "TEST 4: Submit Assessment Answers"
echo "========================================"
print_status "Submitting assessment answers for user $USER_ID..."

ANSWERS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/assessment/batch" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": $USER_ID,
        \"answers\": [
            {\"question_id\": 1, \"answer\": \"agree\"},
            {\"question_id\": 2, \"answer\": \"neutral\"},
            {\"question_id\": 3, \"answer\": \"agree\"},
            {\"question_id\": 4, \"answer\": \"disagree\"},
            {\"question_id\": 5, \"answer\": \"agree\"},
            {\"question_id\": 6, \"answer\": \"neutral\"},
            {\"question_id\": 7, \"answer\": \"agree\"},
            {\"question_id\": 8, \"answer\": \"agree\"},
            {\"question_id\": 9, \"answer\": \"neutral\"},
            {\"question_id\": 10, \"answer\": \"agree\"},
            {\"question_id\": 11, \"answer\": \"agree\"},
            {\"question_id\": 12, \"answer\": \"neutral\"},
            {\"question_id\": 13, \"answer\": \"agree\"},
            {\"question_id\": 14, \"answer\": \"agree\"},
            {\"question_id\": 15, \"answer\": \"agree\"}
        ]
    }")

ANSWERS_CODE=$(echo "$ANSWERS_RESPONSE" | tail -n1)
ANSWERS_BODY=$(echo "$ANSWERS_RESPONSE" | head -n-1)

if [ "$ANSWERS_CODE" = "200" ]; then
    print_success "Assessment answers saved (HTTP $ANSWERS_CODE)"
    echo "$ANSWERS_BODY" | python -m json.tool 2>/dev/null || echo "$ANSWERS_BODY"
else
    print_error "Failed to save answers (HTTP $ANSWERS_CODE)"
    echo "$ANSWERS_BODY" | python -m json.tool 2>/dev/null || echo "$ANSWERS_BODY"
fi
echo ""

# Test 5: Run RIASEC Analysis
echo "========================================"
echo "TEST 5: Run RIASEC Analysis"
echo "========================================"
print_status "Running behavioural analysis for user $USER_ID..."

ANALYSIS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analysis/run" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": $USER_ID}")

ANALYSIS_CODE=$(echo "$ANALYSIS_RESPONSE" | tail -n1)
ANALYSIS_BODY=$(echo "$ANALYSIS_RESPONSE" | head -n-1)

if [ "$ANALYSIS_CODE" = "200" ]; then
    print_success "Analysis completed (HTTP $ANALYSIS_CODE)"
    echo "$ANALYSIS_BODY" | python -m json.tool 2>/dev/null || echo "$ANALYSIS_BODY"
else
    print_error "Analysis failed (HTTP $ANALYSIS_CODE)"
    echo "$ANALYSIS_BODY" | python -m json.tool 2>/dev/null || echo "$ANALYSIS_BODY"
fi
echo ""

# Test 6: Generate Career Roadmap via ADK
echo "========================================"
echo "TEST 6: Generate Career Roadmap (ADK)"
echo "========================================"
print_status "Generating AI-powered career roadmap for user $USER_ID..."
print_status "This may take 10-30 seconds as ADK agents analyze the data..."

ROADMAP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/adk/generate-roadmap" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": $USER_ID, \"force_regenerate\": false}" \
    --max-time 60)

ROADMAP_CODE=$(echo "$ROADMAP_RESPONSE" | tail -n1)
ROADMAP_BODY=$(echo "$ROADMAP_RESPONSE" | head -n-1)

if [ "$ROADMAP_CODE" = "200" ]; then
    print_success "Roadmap generated (HTTP $ROADMAP_CODE)"
    # Pretty print but truncate long output
    echo "$ROADMAP_BODY" | python -c "
import sys, json
data = json.load(sys.stdin)
print(json.dumps(data, indent=2))
" 2>/dev/null || echo "$ROADMAP_BODY"
else
    print_error "Roadmap generation failed (HTTP $ROADMAP_CODE)"
    echo "$ROADMAP_BODY" | python -m json.tool 2>/dev/null || echo "$ROADMAP_BODY"
fi
echo ""

# Test 7: Get User Roadmap
echo "========================================"
echo "TEST 7: Get User Roadmap"
echo "========================================"
print_status "Retrieving saved roadmap for user $USER_ID..."

MY_ROADMAP_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/adk/my-roadmap/$USER_ID")
MY_ROADMAP_CODE=$(echo "$MY_ROADMAP_RESPONSE" | tail -n1)
MY_ROADMAP_BODY=$(echo "$MY_ROADMAP_RESPONSE" | head -n-1)

if [ "$MY_ROADMAP_CODE" = "200" ]; then
    print_success "Roadmap retrieved (HTTP $MY_ROADMAP_CODE)"
    echo "$MY_ROADMAP_BODY" | python -c "
import sys, json
data = json.load(sys.stdin)
print('User Status:', data.get('user', {}).get('status'))
print('Roadmap Generated:', 'Yes' if data.get('roadmap') else 'No')
print('Colleges Count:', data.get('colleges_count', 0))
print('Full Response:')
print(json.dumps(data, indent=2))
" 2>/dev/null || echo "$MY_ROADMAP_BODY"
else
    print_error "Failed to get roadmap (HTTP $MY_ROADMAP_CODE)"
    echo "$MY_ROADMAP_BODY" | python -m json.tool 2>/dev/null || echo "$MY_ROADMAP_BODY"
fi
echo ""

# Test 8: Search Colleges via ADK
echo "========================================"
echo "TEST 8: Search Colleges (ADK)"
echo "========================================"
print_status "Searching colleges for user $USER_ID..."

COLLEGES_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/adk/search-colleges" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": $USER_ID,
        \"specialization\": \"AI/ML\",
        \"districts\": [\"Hyderabad\"]
    }" \
    --max-time 30)

COLLEGES_CODE=$(echo "$COLLEGES_RESPONSE" | tail -n1)
COLLEGES_BODY=$(echo "$COLLEGES_RESPONSE" | head -n-1)

if [ "$COLLEGES_CODE" = "200" ]; then
    print_success "Colleges searched (HTTP $COLLEGES_CODE)"
    echo "$COLLEGES_BODY" | python -m json.tool 2>/dev/null || echo "$COLLEGES_BODY"
else
    print_error "College search failed (HTTP $COLLEGES_CODE)"
    echo "$COLLEGES_BODY" | python -m json.tool 2>/dev/null || echo "$COLLEGES_BODY"
fi
echo ""

# Test 9: List Available ADK Agents
echo "========================================"
echo "TEST 9: List ADK Agents"
echo "========================================"
print_status "Fetching available ADK agents..."

AGENTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/adk/agents")
AGENTS_CODE=$(echo "$AGENTS_RESPONSE" | tail -n1)
AGENTS_BODY=$(echo "$AGENTS_RESPONSE" | head -n-1)

if [ "$AGENTS_CODE" = "200" ]; then
    print_success "Agents listed (HTTP $AGENTS_CODE)"
    echo "$AGENTS_BODY" | python -m json.tool 2>/dev/null || echo "$AGENTS_BODY"
else
    print_error "Failed to list agents (HTTP $AGENTS_CODE)"
fi
echo ""

# Test 10: Chat with ADK Agent
echo "========================================"
echo "TEST 10: Chat with ADK Agent"
echo "========================================"
print_status "Testing chat with EAMCET agent..."

CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/adk/chat" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": \"$USER_ID\",
        \"message\": \"What are the top colleges for AI in Hyderabad?\",
        \"agent_name\": \"eamcet\"
    }" \
    --max-time 30)

CHAT_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
CHAT_BODY=$(echo "$CHAT_RESPONSE" | head -n-1)

if [ "$CHAT_CODE" = "200" ]; then
    print_success "Chat response received (HTTP $CHAT_CODE)"
    echo "$CHAT_BODY" | python -m json.tool 2>/dev/null || echo "$CHAT_BODY"
else
    print_error "Chat failed (HTTP $CHAT_CODE)"
    echo "$CHAT_BODY" | python -m json.tool 2>/dev/null || echo "$CHAT_BODY"
fi
echo ""

# Summary
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo "Test Email: $USER_EMAIL"
echo "User ID: $USER_ID"
echo ""
echo "All tests completed!"
echo "Check the output above for detailed results."
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:8000/docs for interactive API documentation"
echo "2. Check database: SELECT * FROM users WHERE email = '$USER_EMAIL';"
echo "3. Check roadmap: SELECT * FROM recommendations WHERE user_id = $USER_ID;"
