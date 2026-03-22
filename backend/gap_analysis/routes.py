from fastapi import APIRouter
from pydantic import BaseModel
from gap_analysis.analyzer import analyze_gaps
from gap_analysis.explainer import explain_gaps

router = APIRouter()

class SkillInput(BaseModel):
    employee_name: str
    role: str
    assessed_skills: dict

@router.post("/gap-analysis")
def run_gap_analysis(data: SkillInput):
    analysis = analyze_gaps(data.assessed_skills, data.role)
    explained_gaps = explain_gaps(analysis["gaps"], data.role)
    analysis["gaps"] = explained_gaps
    analysis["employee_name"] = data.employee_name
    return analysis
