"""
Behavior Analysis Agent - Using Google ADK
"""

from typing import Dict, List, Any


class BehaviorAgent:
    """
    Analyzes user behavior and personality based on assessment responses.
    Uses RIASEC model for career personality mapping.
    """
    
    def __init__(self):
        self.name = "Behavior Analysis Agent"
        self.description = "Analyzes user personality and behavioral patterns"
        
        # RIASEC dimensions and their traits
        self.riasec_dimensions = {
            "Realistic": {
                "traits": ["practical", "hands-on", "physical", "mechanical"],
                "careers": ["Engineering", "Skilled trades", "Agriculture", "Military"]
            },
            "Investigative": {
                "traits": ["analytical", "scientific", "curious", "methodical"],
                "careers": ["Science", "IT", "Research", "Healthcare"]
            },
            "Artistic": {
                "traits": ["creative", "imaginative", "expressive", "original"],
                "careers": ["Design", "Arts", "Entertainment", "Writing"]
            },
            "Social": {
                "traits": ["helpful", "cooperative", "understanding", "patient"],
                "careers": ["Education", "Healthcare", "Social work", "HR"]
            },
            "Enterprising": {
                "traits": ["leadership", "persuasive", "ambitious", "competitive"],
                "careers": ["Business", "Management", "Sales", "Law"]
            },
            "Conventional": {
                "traits": ["organized", "systematic", "detail-oriented", "efficient"],
                "careers": ["Finance", "Accounting", "Administration", "IT"]
            }
        }
    
    def analyze(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user behavior from assessment data.
        
        Args:
            assessment_data: Dict containing user's assessment responses
            
        Returns:
            Personality analysis results
        """
        answers = assessment_data.get("answers", [])
        
        # Calculate dimension scores
        dimension_scores = {}
        for dim, info in self.riasec_dimensions.items():
            score = 0
            count = 0
            for answer in answers:
                if answer.get("dimension") == dim:
                    # Score: agree=3, neutral=2, disagree=1
                    answer_score = {"agree": 3, "neutral": 2, "disagree": 1}.get(
                        answer.get("answer", "neutral"), 2
                    )
                    weight = answer.get("weight", 1.0)
                    score += answer_score * weight
                    count += 1
            
            dimension_scores[dim] = round(score / max(count, 1), 2) if count > 0 else 0
        
        # Determine personality profile
        sorted_dims = sorted(
            dimension_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        top_dims = [dim for dim, score in sorted_dims[:2] if score >= 2.0]
        personality_profile = " + ".join(top_dims) if top_dims else "Conventional"
        
        # Generate strengths and weaknesses
        strengths = []
        for dim, score in sorted_dims[:3]:
            if score >= 2.5:
                strengths.extend(self.riasec_dimensions[dim]["traits"][:2])
        
        weaknesses = []
        for dim, score in sorted_dims[-2:]:
            if score <= 1.5:
                weaknesses.append(self.riasec_dimensions[dim]["traits"][0])
        
        return {
            "personality_profile": personality_profile,
            "dimension_scores": dimension_scores,
            "top_dimensions": top_dims,
            "strengths": strengths[:5],
            "weaknesses": list(set(weaknesses))[:3],
            "recommended_career_areas": self._get_career_recommendations(dimension_scores)
        }
    
    def _get_career_recommendations(
        self, 
        dimension_scores: Dict[str, float]
    ) -> Dict[str, float]:
        """Get career recommendations based on dimension scores"""
        recommendations = {}
        
        for career_type, info in self._career_dimensions.items():
            score = sum(dimension_scores.get(d, 0) for d in info["dimensions"])
            recommendations[career_type] = round((score / 6) * 100, 1)
        
        return dict(
            sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        )
    
    # Extended career mappings
    _career_dimensions = {
        "AI Engineer": {"dimensions": ["Investigative", "Realistic"]},
        "Software Engineer": {"dimensions": ["Investigative", "Conventional"]},
        "Data Scientist": {"dimensions": ["Investigative", "Conventional"]},
        "Web Developer": {"dimensions": ["Investigative", "Artistic"]},
        "DevOps Engineer": {"dimensions": ["Realistic", "Conventional"]},
        "Cybersecurity": {"dimensions": ["Investigative", "Conventional"]},
        "Cloud Engineer": {"dimensions": ["Investigative", "Conventional"]},
        "Product Manager": {"dimensions": ["Enterprising", "Social"]},
        "UI/UX Designer": {"dimensions": ["Artistic", "Social"]},
        "Full Stack Developer": {"dimensions": ["Investigative", "Realistic"]},
    }


# ADK Agent registration
def create_agent():
    """Create and return the Behavior Analysis Agent"""
    return BehaviorAgent()
