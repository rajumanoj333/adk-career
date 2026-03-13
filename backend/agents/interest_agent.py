"""
Interest Mapping Agent - Using Google ADK
"""

from typing import Dict, List, Any


class InterestAgent:
    """
    Maps user interests to potential career paths.
    Combines personality profile with user interests and skills.
    """
    
    def __init__(self):
        self.name = "Interest Mapping Agent"
        self.description = "Maps user interests to career paths"
        
        # Interest to career mappings
        self.interest_mappings = {
            "AI": ["AI Engineer", "Machine Learning Engineer", "Data Scientist"],
            "machine learning": ["ML Engineer", "Data Scientist", "Research Scientist"],
            "data": ["Data Scientist", "Data Analyst", "Data Engineer"],
            "programming": ["Software Engineer", "Full Stack Developer", "Backend Developer"],
            "coding": ["Software Engineer", "Full Stack Developer", "DevOps Engineer"],
            "web": ["Web Developer", "Frontend Developer", "Full Stack Developer"],
            "design": ["UI/UX Designer", "Product Designer", "Graphic Designer"],
            "graphics": ["UI/UX Designer", "Game Developer", "Graphics Engineer"],
            "security": ["Cybersecurity Analyst", "Penetration Tester", "Security Engineer"],
            "networking": ["Network Engineer", "Sysadmin", "Cloud Engineer"],
            "cloud": ["Cloud Engineer", "DevOps Engineer", "Solutions Architect"],
            "mobile": ["Mobile Developer", "iOS Developer", "Android Developer"],
            "game": ["Game Developer", "Game Designer", "Unity Developer"],
            "blockchain": ["Blockchain Developer", "Web3 Developer", "Smart Contract Dev"],
            "robotics": ["Robotics Engineer", "Automation Engineer", "ML Engineer"],
            "iot": ["IoT Engineer", "Embedded Systems", "Automation Engineer"],
            "hardware": ["Hardware Engineer", "Embedded Systems", "IoT Engineer"],
            "electronics": ["Electronics Engineer", "Embedded Systems", "VLSI Engineer"],
            "management": ["Product Manager", "Project Manager", "Tech Lead"],
            "business": ["Product Manager", "Business Analyst", "Entrepreneur"],
            "teaching": ["Technical Trainer", "EdTech Developer", "Content Creator"],
            "research": ["Research Scientist", "Academic", "ML Researcher"],
            "math": ["Data Scientist", "Quant", "ML Engineer"],
            "statistics": ["Data Scientist", "Data Analyst", "Research Scientist"],
        }
        
        # Skill level mappings
        self.skill_levels = {
            "beginner": {
                "description": "Just starting out",
                "roadmap_focus": "Fundamentals and basics"
            },
            "intermediate": {
                "description": "Some experience",
                "roadmap_focus": "Building projects and depth"
            },
            "advanced": {
                "description": "Professional experience",
                "roadmap_focus": "Specialization and leadership"
            }
        }
    
    def map_interests(
        self,
        interests: List[str],
        personality_profile: str = None,
        academic_background: Dict = None
    ) -> Dict[str, Any]:
        """
        Map user interests to career paths.
        
        Args:
            interests: List of user interests
            personality_profile: Optional personality profile
            academic_background: Optional academic details
            
        Returns:
            Career recommendations with match scores
        """
        # Score careers based on interests
        career_scores = {}
        
        for interest in interests:
            interest_lower = interest.lower()
            if interest_lower in self.interest_mappings:
                for career in self.interest_mappings[interest_lower]:
                    career_scores[career] = career_scores.get(career, 0) + 25
        
        # Normalize scores to 0-100
        if career_scores:
            max_score = max(career_scores.values())
            career_matches = {
                career: min(100, round((score / max_score) * 100, 1))
                for career, score in career_scores.items()
            }
        else:
            career_matches = {}
        
        # Sort by score
        sorted_matches = sorted(
            career_matches.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        # Generate match details
        match_details = []
        for career, score in sorted_matches[:10]:
            match_details.append({
                "career": career,
                "match_score": score,
                "match_level": self._get_match_level(score),
                "reasons": self._get_match_reasons(career, interests)
            })
        
        return {
            "primary_recommendations": match_details[:5],
            "secondary_recommendations": match_details[5:10] if len(match_details) > 5 else [],
            "total_matches": len(career_matches),
            "top_career": sorted_matches[0][0] if sorted_matches else None,
            "confidence": self._calculate_confidence(career_matches)
        }
    
    def _get_match_level(self, score: float) -> str:
        """Get match level label"""
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Very Good"
        elif score >= 40:
            return "Good"
        elif score >= 20:
            return "Fair"
        else:
            return "Low"
    
    def _get_match_reasons(self, career: str, interests: List[str]) -> List[str]:
        """Get reasons for career match"""
        reasons = []
        
        career_lower = career.lower()
        for interest in interests:
            interest_lower = interest.lower()
            
            if interest_lower in self.interest_mappings:
                if career in self.interest_mappings[interest_lower]:
                    reasons.append(f"Matches your interest in {interest}")
        
        # Add general reasons if none found
        if not reasons:
            if "engineer" in career_lower:
                reasons.append("Strong analytical fit")
            elif "developer" in career_lower:
                reasons.append("Technical skill alignment")
            elif "designer" in career_lower:
                reasons.append("Creative alignment")
        
        return reasons[:3]
    
    def _calculate_confidence(self, career_matches: Dict[str, float]) -> str:
        """Calculate confidence level in recommendations"""
        if not career_matches:
            return "Low"
        
        top_score = max(career_matches.values())
        
        if top_score >= 80:
            return "High"
        elif top_score >= 50:
            return "Medium"
        else:
            return "Low"
    
    def combine_with_personality(
        self,
        interest_matches: Dict,
        personality_scores: Dict
    ) -> Dict[str, Any]:
        """
        Combine interest matches with personality scores for final recommendations.
        
        Args:
            interest_matches: Output from map_interests
            personality_scores: RIASEC scores from behavior agent
            
        Returns:
            Combined and weighted recommendations
        """
        combined = {}
        
        # Get all careers from interest matches
        all_careers = set()
        for rec in interest_matches.get("primary_recommendations", []):
            all_careers.add(rec["career"])
        
        # Add personality-based careers
        personality_careers = personality_scores.get("recommended_career_areas", {})
        
        # Combine scores
        for career in all_careers:
            interest_score = 0
            for rec in interest_matches.get("primary_recommendations", []):
                if rec["career"] == career:
                    interest_score = rec["match_score"]
                    break
            
            personality_score = personality_careers.get(career, 50)
            
            # Weighted average (60% interests, 40% personality)
            combined[career] = round(interest_score * 0.6 + personality_score * 0.4, 1)
        
        # Sort and return
        sorted_combined = sorted(combined.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "combined_recommendations": [
                {"career": c, "score": s, "match_level": self._get_match_level(s)}
                for c, s in sorted_combined[:10]
            ],
            "methodology": "60% Interest matching + 40% Personality alignment"
        }


# ADK Agent registration
def create_agent():
    """Create and return the Interest Mapping Agent"""
    return InterestAgent()
