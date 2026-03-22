from neo4j_connection import get_neo4j_session

LEVEL_MAP = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
LEVEL_NAMES = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}

def get_required_skills(role: str):
    session = get_neo4j_session()
    result = session.run("""
        MATCH (r:Role {name: $role})-[req:REQUIRES]->(sk:Skill)
        RETURN sk.name AS skill, req.level AS required_level
    """, role=role)
    skills = {r["skill"]: r["required_level"] for r in result}
    session.close()
    return skills

def analyze_gaps(employee_skills: dict, role: str):
    required = get_required_skills(role)
    gaps = []
    met = []

    for skill, required_level in required.items():
        req_num = LEVEL_MAP.get(required_level, 1)
        emp_level = employee_skills.get(skill, "Beginner")
        emp_num = LEVEL_MAP.get(emp_level, 1)

        if emp_num < req_num:
            gaps.append({
                "skill": skill,
                "your_level": emp_level,
                "required_level": required_level,
                "gap_size": req_num - emp_num,
                "urgency": "High" if (req_num - emp_num) >= 2 else "Medium"
            })
        else:
            met.append({
                "skill": skill,
                "your_level": emp_level,
                "required_level": required_level,
                "status": "Met"
            })

    gaps.sort(key=lambda x: x["gap_size"], reverse=True)

    return {
        "role": role,
        "total_skills_required": len(required),
        "gaps_found": len(gaps),
        "skills_met": len(met),
        "gaps": gaps,
        "met": met
    }
