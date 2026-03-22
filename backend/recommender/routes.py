from fastapi import APIRouter
from pydantic import BaseModel
from gap_analysis.analyzer import analyze_gaps
from gap_analysis.explainer import explain_gaps
from recommender.engine import recommend_courses

router = APIRouter()

class EmployeeInput(BaseModel):
    employee_name: str
    role: str
    assessed_skills: dict

@router.post("/full-report")
def get_full_report(data: EmployeeInput):
    analysis = analyze_gaps(data.assessed_skills, data.role)
    explained_gaps = explain_gaps(analysis["gaps"], data.role)
    recommendations = recommend_courses(explained_gaps)

    return {
        "employee_name": data.employee_name,
        "role": data.role,
        "summary": {
            "total_skills_required": analysis["total_skills_required"],
            "gaps_found": analysis["gaps_found"],
            "skills_met": analysis["skills_met"],
            "total_courses": recommendations["total_courses"],
            "total_hours": recommendations["total_hours"],
            "estimated_weeks": recommendations["estimated_weeks"]
        },
        "gaps": explained_gaps,
        "learning_path": recommendations["learning_path"],
        "skills_met": analysis["met"]
    }
