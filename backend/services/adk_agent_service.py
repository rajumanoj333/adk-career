"""
ADK Agent Service - Integration layer for Google ADK agents
"""

import os
import asyncio
import json
import re
from typing import Dict, Any, Optional, List
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Import eamcet_agent components
eamcet_path = os.path.join(os.path.dirname(__file__), '..', '..', 'eamcet_agent')
if eamcet_path not in os.sys.path:
    os.sys.path.insert(0, eamcet_path)

from agent import root_agent as eamcet_root_agent
from agents.career_coordinator import career_coordinator


class ADKAgentService:
    """
    Service wrapper for Google ADK agents.
    Provides async methods to interact with ADK agents from FastAPI endpoints.
    """

    def __init__(self):
        self.name = "ADK Agent Service"
        self.session_service = InMemorySessionService()
        self.runners: Dict[str, Runner] = {}
        self._initialized = False

    async def initialize(self):
        """Initialize ADK agents on startup"""
        if self._initialized:
            return

        # Set up environment for Google ADK
        if not os.getenv("GOOGLE_API_KEY"):
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'eamcet_agent', '.env'))

        # Initialize runners for each agent
        self.runners["eamcet"] = Runner(
            app_name="eamcet",
            agent=eamcet_root_agent,
            session_service=self.session_service
        )

        self.runners["career_coordinator"] = Runner(
            app_name="career_coordinator",
            agent=career_coordinator,
            session_service=self.session_service
        )

        self._initialized = True
        print("✅ ADK Agents initialized")

    async def run_agent(
        self,
        agent_name: str,
        user_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Run an ADK agent with the given message."""
        if not self._initialized:
            await self.initialize()

        if agent_name not in self.runners:
            return {
                "status": "error",
                "message": f"Agent '{agent_name}' not found. Available: {list(self.runners.keys())}"
            }

        runner = self.runners[agent_name]
        session_id = f"{user_id}_{agent_name}"
        
        # Create session first
        await self.session_service.create_session(
            app_name=agent_name,
            user_id=user_id,
            session_id=session_id,
            state=context or {}
        )
        
        # Create user message
        user_message = types.Content(role="user", parts=[types.Part(text=message)])
        
        # Run the agent and collect events
        response_text = ""
        try:
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=user_message
            ):
                if hasattr(event, 'text') and event.text:
                    response_text += event.text
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

        return {
            "status": "success",
            "agent": agent_name,
            "response": response_text,
            "session_id": session_id
        }

    async def generate_career_roadmap(
        self,
        user_id: str,
        user_profile: Dict[str, Any],
        analysis_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive career roadmap using ADK career coordinator.

        Args:
            user_id: User identifier
            user_profile: Complete user profile from database
            analysis_data: RIASEC analysis results from assessment

        Returns:
            Complete roadmap with colleges, phases, and milestones
        """
        prompt = self._build_career_prompt(user_profile, analysis_data)
        result = await self.run_agent("career_coordinator", user_id, prompt)

        if result["status"] == "error":
            return result

        roadmap_data = self._parse_roadmap_response(result["response"])

        if "colleges" not in roadmap_data or not roadmap_data.get("colleges"):
            colleges = await self.search_colleges_for_specialization(
                user_id,
                roadmap_data.get("target_specialization", "AI/ML"),
                user_profile.get("preferred_cities", ["Hyderabad"])
            )
            roadmap_data["colleges"] = colleges

        return {
            **result,
            "roadmap": roadmap_data
        }

    async def search_colleges_for_specialization(
        self,
        user_id: str,
        specialization: str,
        districts: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search colleges for a specific specialization using ADK."""
        districts = districts or ["Hyderabad"]
        colleges = []
        
        for district in districts:
            message = f"Find M.Tech colleges offering {specialization} in {district} district"
            result = await self.run_agent("eamcet", user_id, message)
            
            if result["status"] == "success":
                parsed = self._parse_college_response(result["response"])
                colleges.extend(parsed)
        
        return colleges

    def _build_career_prompt(self, profile: Dict[str, Any], analysis: Optional[Dict[str, Any]] = None) -> str:
        """Build comprehensive career planning prompt with assessment data"""
        parts = []

        if profile.get("name"):
            parts.append(f"Name: {profile['name']}")
        if profile.get("entrance_exam"):
            parts.append(f"Entrance Exam: {profile['entrance_exam']}")
            if profile.get("entrance_rank"):
                parts.append(f"Rank: {profile['entrance_rank']}")
        if profile.get("tenth_marks"):
            parts.append(f"10th Marks: {profile['tenth_marks']}%")
        if profile.get("twelfth_marks"):
            parts.append(f"12th Marks: {profile['twelfth_marks']}%")
        if profile.get("interests"):
            interests = profile["interests"] if isinstance(profile["interests"], list) else [profile["interests"]]
            parts.append(f"Interests: {', '.join(interests)}")
        if profile.get("preferred_cities"):
            cities = profile["preferred_cities"] if isinstance(profile["preferred_cities"], list) else [profile["preferred_cities"]]
            parts.append(f"Preferred Cities: {', '.join(cities)}")
        if profile.get("budget"):
            parts.append(f"Budget: ₹{profile['budget']} Lakhs")

        # ADD ASSESSMENT DATA (RIASEC Analysis)
        if analysis:
            parts.append("\n--- PERSONALITY ASSESSMENT RESULTS ---")
            if analysis.get("personality_profile"):
                parts.append(f"Personality Profile: {analysis['personality_profile']}")
            if analysis.get("riasec_scores"):
                scores = analysis["riasec_scores"]
                scores_str = ", ".join([f"{k}: {v}" for k, v in scores.items()])
                parts.append(f"RIASEC Scores: {scores_str}")
            if analysis.get("strengths"):
                parts.append(f"Strengths: {', '.join(analysis['strengths'])}")
            if analysis.get("weaknesses"):
                parts.append(f"Areas to Develop: {', '.join(analysis['weaknesses'])}")
            if analysis.get("career_matches"):
                top_careers = list(analysis["career_matches"].items())[:5]
                careers_str = ", ".join([f"{c} ({s}%)" for c, s in top_careers])
                parts.append(f"Top Career Matches: {careers_str}")

        prompt = """I need a complete M.Tech career roadmap. Please analyze my profile and provide:

1. **Recommended Specialization**: Based on my interests, academic background, AND personality profile
2. **Career Path**: Clear career trajectory with job roles
3. **College Recommendations**: Top 5-10 colleges for my specialization in my preferred cities
4. **Complete Roadmap**: Month-by-month plan from now through career launch

**IMPORTANT**: Use the personality assessment results (RIASEC scores) to personalize recommendations.
Match the specialization to both their interests AND personality type for optimal career success.

"""
        if parts:
            prompt += f"\n**My Profile:**\n" + "\n".join(parts)

        prompt += """

**Please provide your response in this JSON format:**
```json
{
    "target_specialization": "Your recommended specialization",
    "career_path": "Career trajectory description",
    "job_roles": ["Role 1", "Role 2", "Role 3"],
    "colleges": [
        {
            "name": "College Name",
            "location": "City, District",
            "specialization": "Course name",
            "estimated_fee": 100000,
            "reason": "Why this college is recommended"
        }
    ],
    "roadmap_phases": [
        {
            "phase": 1,
            "title": "Phase name",
            "duration_months": 3,
            "activities": ["Activity 1", "Activity 2"],
            "milestones": ["Milestone 1", "Milestone 2"]
        }
    ],
    "timeline": {
        "preparation_months": 3,
        "mtech_duration_months": 24,
        "job_search_months": 3,
        "total_months": 30
    },
    "salary_projection": {
        "starting_lpa": 8,
        "year_3_lpa": 18,
        "year_5_lpa": 30
    }
}
```"""

        return prompt

    def _parse_roadmap_response(self, response: str) -> Dict[str, Any]:
        """Parse ADK response to extract structured roadmap data"""
        try:
            json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            try:
                return json.loads(response)
            except:
                pass
        except Exception as e:
            print(f"Failed to parse JSON: {e}")
        
        return {
            "target_specialization": "AI/ML",
            "career_path": "M.Tech → AI Engineer → Senior ML Engineer → AI Architect",
            "job_roles": ["AI Engineer", "ML Engineer", "Data Scientist", "Research Scientist"],
            "colleges": [],
            "roadmap_phases": [
                {"phase": 1, "title": "Preparation", "duration_months": 3, "activities": ["Prepare for entrance"], "milestones": ["Complete preparation"]},
                {"phase": 2, "title": "M.Tech Studies", "duration_months": 24, "activities": ["Coursework", "Projects"], "milestones": ["Complete degree"]},
                {"phase": 3, "title": "Career Launch", "duration_months": 3, "activities": ["Job search"], "milestones": ["Get job offer"]}
            ],
            "timeline": {"preparation_months": 3, "mtech_duration_months": 24, "job_search_months": 3, "total_months": 30},
            "salary_projection": {"starting_lpa": 8, "year_3_lpa": 18, "year_5_lpa": 30},
            "raw_analysis": response
        }

    def _parse_college_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse college search response"""
        colleges = []
        lines = response.split('\n')
        current_college = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_college:
                    colleges.append(current_college)
                    current_college = {}
                continue
            
            if 'NAME:' in line.upper() or ('college' in line.lower() and ':' in line):
                current_college['name'] = line.split(':', 1)[-1].strip() if ':' in line else line
            elif 'ADDRESS:' in line.upper() or 'location' in line.lower():
                current_college['location'] = line.split(':', 1)[-1].strip() if ':' in line else line
            elif 'COURSE:' in line.upper() or 'specialization' in line.lower():
                current_college['specialization'] = line.split(':', 1)[-1].strip() if ':' in line else line
            elif 'INTAKE:' in line.upper():
                try:
                    current_college['intake'] = int(line.split(':', 1)[-1].strip())
                except:
                    pass
        
        if current_college and current_college.get('name'):
            colleges.append(current_college)
        
        return colleges

    async def chat(
        self,
        user_id: str,
        message: str,
        agent_name: str = "eamcet",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generic chat method for any ADK agent."""
        return await self.run_agent(agent_name, user_id, message, context)


adk_service = ADKAgentService()


async def get_adk_service() -> ADKAgentService:
    """Dependency injection for FastAPI"""
    await adk_service.initialize()
    return adk_service
