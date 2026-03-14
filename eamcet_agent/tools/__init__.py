# Use absolute import when package is imported directly
try:
    from .career_analysis import (
        search_career_specializations,
        get_colleges_for_specialization,
        analyze_career_popularity,
        get_regional_opportunities,
        match_skills_to_specializations,
        get_growth_specializations
    )
    from .career_roadmap import (
        generate_college_to_career_roadmap,
        calculate_career_alignment_score
    )
except ImportError:
    from eamcet_agent.tools.career_analysis import (
        search_career_specializations,
        get_colleges_for_specialization,
        analyze_career_popularity,
        get_regional_opportunities,
        match_skills_to_specializations,
        get_growth_specializations
    )
    from eamcet_agent.tools.career_roadmap import (
        generate_college_to_career_roadmap,
        calculate_career_alignment_score
    )

__all__ = [
    "search_career_specializations",
    "get_colleges_for_specialization",
    "analyze_career_popularity",
    "get_regional_opportunities",
    "match_skills_to_specializations",
    "get_growth_specializations",
    "generate_college_to_career_roadmap",
    "calculate_career_alignment_score"
]
