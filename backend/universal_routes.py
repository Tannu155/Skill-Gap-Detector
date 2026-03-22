from fastapi import APIRouter
from pydantic import BaseModel
from ai_role_analyzer import get_required_skills_for_role
from ai_gap_analysis import run_full_analysis
from adaptive_test.engine import AdaptiveTestEngine
import uuid

router = APIRouter()
active_sessions = {}

PREDEFINED_ROLES = [
    "Data Analyst", "Web Developer", "ML Engineer",
    "Marketing Manager", "Product Manager", "Business Analyst",
    "Graphic Designer", "Content Writer", "HR Manager",
    "Financial Analyst", "Sales Manager", "Digital Marketer",
    "Cybersecurity Analyst", "Cloud Engineer", "DevOps Engineer",
    "Mobile App Developer", "UI/UX Designer", "Data Scientist",
    "Network Engineer", "Database Administrator"
]

class UniversalReportInput(BaseModel):
    employee_name: str
    role: str
    assessed_skills: dict

class StartTestInput(BaseModel):
    role: str
    skill: str

@router.get("/universal/roles")
def get_all_roles():
    return {"predefined_roles": PREDEFINED_ROLES}

@router.get("/universal/skills-for-role/{role}")
def get_skills_for_role(role: str):
    try:
        skills = get_required_skills_for_role(role)
        return {"role": role, "required_skills": skills}
    except Exception as e:
        return {"error": str(e)}

@router.post("/universal/start-test/{skill}")
def start_universal_test(skill: str):
    session_id = str(uuid.uuid4())
    engine = AdaptiveTestEngine(skill=skill)
    question = engine.get_next_question()
    if not question:
        return {"error": f"Could not generate question for: {skill}"}
    active_sessions[session_id] = engine
    return {
        "session_id": session_id,
        "skill": skill,
        "question": question
    }

@router.post("/universal/full-report")
def get_universal_report(data: UniversalReportInput):
    try:
        report = run_full_analysis(
            employee_name=data.employee_name,
            role=data.role,
            assessed_skills=data.assessed_skills
        )
        return report
    except Exception as e:
        return {"error": str(e)}
