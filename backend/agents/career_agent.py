"""
Career Path Agent - Using Google ADK
"""

from typing import Dict, List, Any, Optional


class CareerAgent:
    """
    Generates personalized career roadmaps based on user profile and interests.
    """
    
    def __init__(self):
        self.name = "Career Path Agent"
        self.description = "Generates career roadmaps and guidance"
        
        # Career details database
        self.career_details = {
            "AI Engineer": {
                "description": "Build AI/ML systems and intelligent applications",
                "avg_salary": "₹8-25 LPA",
                "demand": "Very High",
                "growth": "35% YoY",
                "skills": ["Python", "TensorFlow", "PyTorch", "ML", "Data Engineering"],
                "education": "B.Tech/M.Tech in CS/AI/ML"
            },
            "Software Engineer": {
                "description": "Design and build software applications",
                "avg_salary": "₹5-20 LPA",
                "demand": "High",
                "growth": "20% YoY",
                "skills": ["Programming", "Data Structures", "Algorithms", "Git"],
                "education": "B.Tech in CS/IT/Related"
            },
            "Data Scientist": {
                "description": "Extract insights from data using statistics and ML",
                "avg_salary": "₹7-22 LPA",
                "demand": "Very High",
                "growth": "30% YoY",
                "skills": ["Python", "Statistics", "ML", "SQL", "Visualization"],
                "education": "B.Tech/M.Sc in CS/Statistics/Math"
            },
            "Web Developer": {
                "description": "Build websites and web applications",
                "avg_salary": "₹4-15 LPA",
                "demand": "High",
                "growth": "15% YoY",
                "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
                "education": "B.Tech/BCA/B.Sc in CS/IT"
            },
            "DevOps Engineer": {
                "description": "Automate and manage infrastructure and CI/CD",
                "avg_salary": "₹6-18 LPA",
                "demand": "High",
                "growth": "25% YoY",
                "skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"],
                "education": "B.Tech in CS/IT/ECE"
            },
            "Cybersecurity": {
                "description": "Protect systems and networks from threats",
                "avg_salary": "₹5-20 LPA",
                "demand": "Very High",
                "growth": "40% YoY",
                "skills": ["Networking", "Security", "Penetration Testing", "SIEM"],
                "education": "B.Tech in CS/IT/ECE"
            },
            "Cloud Engineer": {
                "description": "Design and manage cloud infrastructure",
                "avg_salary": "₹6-20 LPA",
                "demand": "High",
                "growth": "30% YoY",
                "skills": ["AWS/Azure/GCP", "Terraform", "Docker", "Kubernetes"],
                "education": "B.Tech in CS/IT"
            },
            "Product Manager": {
                "description": "Lead product strategy and development",
                "avg_salary": "₹10-30 LPA",
                "demand": "High",
                "growth": "25% YoY",
                "skills": ["Strategy", "Analytics", "Communication", "Agile"],
                "education": "MBA/B.Tech + MBA"
            },
            "UI/UX Designer": {
                "description": "Design user interfaces and experiences",
                "avg_salary": "₹4-15 LPA",
                "demand": "High",
                "growth": "20% YoY",
                "skills": ["Figma", "Adobe XD", "User Research", "Prototyping"],
                "education": "B.Des/M.Des in Design"
            },
            "Full Stack Developer": {
                "description": "Build complete web applications (front + back)",
                "avg_salary": "₹5-18 LPA",
                "demand": "Very High",
                "growth": "25% YoY",
                "skills": ["React", "Node.js", "MongoDB", "SQL", "Git"],
                "education": "B.Tech/BCA in CS/IT"
            }
        }
        
        # Roadmap templates
        self.roadmap_templates = self._load_roadmap_templates()
    
    def _load_roadmap_templates(self) -> Dict[str, Any]:
        """Load career roadmap templates"""
        return {
            "AI Engineer": {
                "stages": [
                    {"stage": 1, "title": "Python Mastery", "duration": "2-3 months",
                     "topics": ["Python basics", "OOP", "Data structures", "Algorithms"]},
                    {"stage": 2, "title": "Math & Statistics", "duration": "2-3 months",
                     "topics": ["Linear algebra", "Probability", "Statistics", "Calculus"]},
                    {"stage": 3, "title": "Machine Learning", "duration": "4-6 months",
                     "topics": ["Supervised learning", "Unsupervised learning", "Scikit-learn"]},
                    {"stage": 4, "title": "Deep Learning", "duration": "4-6 months",
                     "topics": ["Neural networks", "TensorFlow/PyTorch", "CNNs", "RNNs", "Transformers"]},
                    {"stage": 5, "title": "Specialization Projects", "duration": "6+ months",
                     "topics": ["Computer Vision", "NLP", "RL", "Portfolio projects"]}
                ]
            },
            "Software Engineer": {
                "stages": [
                    {"stage": 1, "title": "Programming Fundamentals", "duration": "3-4 months",
                     "topics": ["Language basics", "OOP", "Data structures"]},
                    {"stage": 2, "title": "DSA & Problem Solving", "duration": "4-6 months",
                     "topics": ["Arrays", "Linked Lists", "Trees", "Graphs", "DP"]},
                    {"stage": 3, "title": "Web Technologies", "duration": "3-4 months",
                     "topics": ["HTML/CSS", "JavaScript", "Frontend", "Backend"]},
                    {"stage": 4, "title": "Databases & Systems", "duration": "2-3 months",
                     "topics": ["SQL", "NoSQL", "System design", "OS"]},
                    {"stage": 5, "title": "Projects & Placement", "duration": "6+ months",
                     "topics": ["Full-stack projects", "Git", "Resume", "Interview prep"]}
                ]
            }
        }
    
    def generate_roadmap(
        self,
        career: str,
        current_level: str = "beginner",
        target_years: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized career roadmap.
        
        Args:
            career: Target career
            current_level: beginner/intermediate/advanced
            target_years: Optional target years to complete
            
        Returns:
            Complete roadmap with stages
        """
        # Get career details
        details = self.career_details.get(career, {})
        
        # Get roadmap template
        template = self.roadmap_templates.get(career, self.roadmap_templates["Software Engineer"])
        
        # Customize based on current level
        stages = self._customize_stages(template["stages"], current_level)
        
        # Calculate total duration
        total_months = sum([
            int(s["duration"].split("-")[0].split()[0]) if "-" in s["duration"] 
            else int(s["duration"].split()[0])
            for s in stages
        ])
        
        return {
            "career": career,
            "description": details.get("description", ""),
            "current_level": current_level,
            "target_years": target_years,
            "estimated_duration": f"{total_months} months",
            "salary_range": details.get("avg_salary", "TBD"),
            "demand": details.get("demand", "High"),
            "growth": details.get("growth", "20% YoY"),
            "required_skills": details.get("skills", []),
            "education": details.get("education", "B.Tech"),
            "stages": stages,
            "milestones": self._generate_milestones(stages)
        }
    
    def _customize_stages(
        self, 
        stages: List[Dict], 
        current_level: str
    ) -> List[Dict]:
        """Customize roadmap based on current level"""
        if current_level == "beginner":
            return stages
        elif current_level == "intermediate":
            # Skip foundation stages
            return stages[2:] if len(stages) > 2 else stages
        elif current_level == "advanced":
            # Focus on advanced topics
            return stages[-2:] if len(stages) > 1 else stages
        return stages
    
    def _generate_milestones(self, stages: List[Dict]) -> List[Dict]:
        """Generate key milestones"""
        milestones = []
        cumulative_months = 0
        
        for stage in stages:
            duration = stage["duration"]
            months = int(duration.split("-")[0].split()[0]) if "-" in duration else int(duration.split()[0])
            cumulative_months += months
            
            milestones.append({
                "after_months": cumulative_months,
                "title": stage["title"],
                "key_deliverable": f"Complete {stage['title']} with projects"
            })
        
        return milestones
    
    def get_career_details(self, career: str) -> Dict[str, Any]:
        """Get detailed information about a career"""
        return self.career_details.get(career, {
            "description": "Information not available",
            "avg_salary": "TBD",
            "demand": "TBD",
            "growth": "TBD",
            "skills": [],
            "education": "TBD"
        })
    
    def list_careers(self) -> List[str]:
        """List all available careers"""
        return list(self.career_details.keys())
    
    def compare_careers(self, careers: List[str]) -> Dict[str, Any]:
        """Compare multiple careers"""
        comparison = {}
        
        for career in careers:
            details = self.career_details.get(career, {})
            comparison[career] = {
                "salary": details.get("avg_salary", "TBD"),
                "demand": details.get("demand", "TBD"),
                "growth": details.get("growth", "TBD"),
                "skills_count": len(details.get("skills", []))
            }
        
        return comparison


# ADK Agent registration
def create_agent():
    """Create and return the Career Path Agent"""
    return CareerAgent()
