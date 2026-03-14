import os
import psycopg2
from psycopg2.extras import RealDictCursor
from google.adk.agents.llm_agent import Agent
from typing import Optional

# ========================
# DATABASE CONFIGURATION
# ========================
DB_CONFIG = {
    "host": "34.27.117.60",
    "database": "eamcet_db",
    "user": "postgres",
    "password": os.getenv("DB_PASSWORD"),
    "port": 5432
}

# ========================
# DATABASE TOOLS
# ========================

def search_colleges(district: str) -> dict:
    """
    Searches M.Tech colleges in a given district.
    
    Args:
        district: District name to search for
        
    Returns:
        dict with status and college data or error message
    """
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT "NAME", "ADDRESS", "COURSE", "INTAKE" 
            FROM mtech_colleges 
            WHERE "DISTRICT" ILIKE %s 
            LIMIT 5;
        """
        
        cursor.execute(query, (f"%{district}%",))
        results = cursor.fetchall()
        
        cursor.close()
        
        return {
            "status": "success",
            "data": results,
            "count": len(results)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        if conn is not None:
            conn.close()


def count_colleges(district: str) -> dict:
    """
    Counts M.Tech colleges in a given district.
    
    Args:
        district: District name to count
        
    Returns:
        dict with status and college count or error message
    """
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        query = """
            SELECT COUNT(*) 
            FROM mtech_colleges 
            WHERE "DISTRICT" ILIKE %s;
        """
        
        cursor.execute(query, (f"%{district}%",))
        count = cursor.fetchone()[0]
        
        cursor.close()
        
        return {
            "status": "success",
            "count": count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        if conn is not None:
            conn.close()


# ========================
# IMPORTS FROM AGENTS
# ========================

# Use absolute import when package is imported directly
try:
    from agents.career_coordinator import career_coordinator
except ImportError:
    from eamcet_agent.agents.career_coordinator import career_coordinator


# ========================
# AGENT CONFIGURATION
# ========================

root_agent = Agent(
    model="gemini-2.0-flash-lite",  # Lower model for better quota availability
    name="eamcet_agent",
    description="Multi-agent system for M.Tech colleges and personalized career planning",
    instruction=(
        "You are an intelligent router directing users to specialists.\n\n"
        "COLLEGE SEARCH QUERIES: 'find colleges', 'colleges in', 'M.Tech where' → use college_search_tools\n"
        "CAREER PLANNING QUERIES: 'career path', 'roadmap', 'specialization', 'what should I study' → delegate to career_coordinator\n"
        "COMBINED QUERIES: Answer college questions first, then delegate career roadmap to career_coordinator\n\n"
        "Route intelligently and provide clear context when delegating."
    ),
    tools=[search_colleges, count_colleges],
    sub_agents=[career_coordinator],
)
