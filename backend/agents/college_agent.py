"""
College Recommendation Agent - Using Google ADK
"""

from typing import Dict, List, Any, Optional
import json


class CollegeAgent:
    """
    Recommends colleges based on user rank, preferences, and seat availability.
    """
    
    def __init__(self):
        self.name = "College Recommendation Agent"
        self.description = "Recommends colleges and predicts seat probability"
        
        # College database
        self.colleges = self._load_college_data()
        
        # Course categories
        self.course_categories = {
            "CSE": {"full": "Computer Science Engineering", "demand": "Very High"},
            "ECE": {"full": "Electronics & Communication Engineering", "demand": "High"},
            "EEE": {"full": "Electrical & Electronics Engineering", "demand": "High"},
            "ME": {"full": "Mechanical Engineering", "demand": "Medium"},
            "CE": {"full": "Civil Engineering", "demand": "Medium"},
            "IT": {"full": "Information Technology", "demand": "Very High"},
            "AE": {"full": "Aeronautical Engineering", "demand": "Medium"},
            "PE": {"full": "Production Engineering", "demand": "Low"},
            "CHEM": {"full": "Chemical Engineering", "demand": "Medium"},
            "MME": {"full": "Metallurgy & Materials Engineering", "demand": "Low"}
        }
    
    def _load_college_data(self) -> List[Dict]:
        """Load college data"""
        return [
            {
                "id": 1, "name": "JNTU Hyderabad", "code": "JNTUH",
                "location": "Kukatpally, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 1500, "fee": 45000}, "ECE": {"rank": 2500, "fee": 45000},
                           "EEE": {"rank": 3500, "fee": 45000}, "ME": {"rank": 8000, "fee": 45000}},
                "rating": 4.2, "autonomous": True, "nba": True
            },
            {
                "id": 2, "name": "VNR VJIET", "code": "VNRVJIET",
                "location": "Bachupally, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 3500, "fee": 120000}, "ECE": {"rank": 5000, "fee": 120000},
                           "EEE": {"rank": 8000, "fee": 120000}, "ME": {"rank": 12000, "fee": 120000}, "IT": {"rank": 4000, "fee": 120000}},
                "rating": 4.5, "autonomous": True, "nba": True
            },
            {
                "id": 3, "name": "GNITS", "code": "GNITS",
                "location": "Shaikpet, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 5000, "fee": 100000}, "ECE": {"rank": 8000, "fee": 100000},
                           "EEE": {"rank": 12000, "fee": 100000}, "ME": {"rank": 18000, "fee": 100000}},
                "rating": 4.3, "autonomous": True, "nba": True
            },
            {
                "id": 4, "name": "CBIT", "code": "CBIT",
                "location": "Gandipet, Hyderabad", "city": "Hyderabad",
                "university": "Osmania University", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 6000, "fee": 95000}, "ECE": {"rank": 9000, "fee": 95000},
                           "EEE": {"rank": 15000, "fee": 95000}, "ME": {"rank": 20000, "fee": 95000}, "CE": {"rank": 25000, "fee": 95000}},
                "rating": 4.4, "autonomous": True, "nba": True
            },
            {
                "id": 5, "name": "Vasavi College of Engineering", "code": "VCE",
                "location": "Ibrahim Bagh, Hyderabad", "city": "Hyderabad",
                "university": "Osmania University", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 8000, "fee": 110000}, "ECE": {"rank": 12000, "fee": 110000},
                           "EEE": {"rank": 18000, "fee": 110000}, "ME": {"rank": 25000, "fee": 110000}},
                "rating": 4.1, "autonomous": True, "nba": True
            },
            {
                "id": 6, "name": "MGIT", "code": "MGIT",
                "location": "Gandipet, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 10000, "fee": 85000}, "ECE": {"rank": 15000, "fee": 85000},
                           "EEE": {"rank": 20000, "fee": 85000}, "ME": {"rank": 30000, "fee": 85000}, "IT": {"rank": 12000, "fee": 85000}},
                "rating": 4.0, "autonomous": True, "nba": True
            },
            {
                "id": 7, "name": "IARE", "code": "IARE",
                "location": "Dundigal, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 12000, "fee": 90000}, "ECE": {"rank": 18000, "fee": 90000},
                           "EEE": {"rank": 25000, "fee": 90000}, "AE": {"rank": 30000, "fee": 90000}},
                "rating": 3.9, "autonomous": True, "nba": False
            },
            {
                "id": 8, "name": "CVR College of Engineering", "code": "CVRCE",
                "location": "Moula Ali, Hyderabad", "city": "Hyderabad",
                "university": "JNTU Hyderabad", "district": "Hyderabad",
                "courses": {"CSE": {"rank": 15000, "fee": 80000}, "ECE": {"rank": 22000, "fee": 80000},
                           "EEE": {"rank": 30000, "fee": 80000}, "ME": {"rank": 40000, "fee": 80000}},
                "rating": 3.8, "autonomous": True, "nba": False
            }
        ]
    
    def recommend(
        self,
        rank: int,
        course: str = "CSE",
        city: Optional[str] = None,
        budget_lakhs: Optional[int] = None,
        preferred_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get college recommendations based on rank and preferences.
        
        Args:
            rank: Entrance exam rank
            course: Preferred course (CSE, ECE, etc.)
            city: Preferred city
            budget_lakhs: Budget in lakhs
            preferred_type: autonomous/affiliated
            
        Returns:
            List of recommended colleges with probabilities
        """
        recommendations = []
        
        for college in self.colleges:
            # Check if course is available
            if course not in college["courses"]:
                continue
            
            course_data = college["courses"][course]
            
            # Check city preference
            if city and city.lower() not in college["city"].lower():
                continue
            
            # Check budget
            if budget_lakhs:
                fee_in_lakhs = course_data["fee"] / 100000
                if fee_in_lakhs > budget_lakhs:
                    continue
            
            # Calculate probability
            probability = self._calculate_probability(rank, course_data["rank"])
            
            # Determine seat type
            seat_type = self._determine_seat_type(rank, course_data["rank"])
            
            recommendations.append({
                "college": {
                    "id": college["id"],
                    "name": college["name"],
                    "code": college["code"],
                    "location": college["location"],
                    "city": college["city"],
                    "university": college["university"],
                    "rating": college["rating"],
                    "autonomous": college["autonomous"],
                    "nba": college["nba"]
                },
                "course": course,
                "closing_rank": course_data["rank"],
                "tuition_fee": course_data["fee"],
                "probability": probability,
                "seat_type": seat_type,
                "recommendation_reason": self._get_reason(probability)
            })
        
        # Sort by probability
        recommendations.sort(key=lambda x: x["probability"], reverse=True)
        
        return {
            "query": {"rank": rank, "course": course, "city": city, "budget": budget_lakhs},
            "total_matches": len(recommendations),
            "recommendations": recommendations[:10]
        }
    
    def _calculate_probability(self, user_rank: int, closing_rank: int) -> float:
        """Calculate seat probability based on rank"""
        if user_rank <= closing_rank * 0.7:
            return 95.0
        elif user_rank <= closing_rank:
            return round(50 + (closing_rank - user_rank) / closing_rank * 45, 1)
        elif user_rank <= closing_rank * 1.5:
            return round(30 + (closing_rank * 1.5 - user_rank) / (closing_rank * 0.5) * 20, 1)
        elif user_rank <= closing_rank * 2:
            return round(15 + (closing_rank * 2 - user_rank) / (closing_rank * 0.5) * 15, 1)
        else:
            return round(max(0, 20 - (user_rank - closing_rank * 2) / 1000), 1)
    
    def _determine_seat_type(self, user_rank: int, closing_rank: int) -> str:
        """Determine seat type"""
        if user_rank <= closing_rank:
            return "Counseling (Free)"
        elif user_rank <= closing_rank * 1.3:
            return "Counseling (Borderline)"
        elif user_rank <= closing_rank * 2:
            return "Management Quota"
        else:
            return "Difficult"
    
    def _get_reason(self, probability: float) -> str:
        """Get recommendation reason"""
        if probability >= 90:
            return "Excellent chance - Apply confidently"
        elif probability >= 70:
            return "Good chance - Strong possibility"
        elif probability >= 50:
            return "Moderate chance - Consider as backup"
        else:
            return "Low chance - Risky option"
    
    def get_college_details(self, college_id: int) -> Optional[Dict]:
        """Get detailed information about a college"""
        for college in self.colleges:
            if college["id"] == college_id:
                return college
        return None
    
    def search_colleges(
        self,
        course: Optional[str] = None,
        city: Optional[str] = None,
        min_rating: Optional[float] = None,
        max_fee: Optional[int] = None
    ) -> List[Dict]:
        """Search colleges with filters"""
        results = []
        
        for college in self.colleges:
            # Course filter
            if course and course not in college["courses"]:
                continue
            
            # City filter
            if city and city.lower() not in college["city"].lower():
                continue
            
            # Rating filter
            if min_rating and college["rating"] < min_rating:
                continue
            
            # Fee filter
            if max_fee:
                has_course_in_budget = False
                for c, data in college["courses"].items():
                    if data["fee"] <= max_fee * 100000:
                        has_course_in_budget = True
                        break
                if not has_course_in_budget:
                    continue
            
            results.append(college)
        
        return results


# ADK Agent registration
def create_agent():
    """Create and return the College Recommendation Agent"""
    return CollegeAgent()
