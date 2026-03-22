from ai_role_analyzer import get_required_skills_for_role, get_ai_course_recommendations

LEVEL_MAP = {"Basic": 1, "Beginner": 1, "Intermediate": 2, "Advanced": 3}
LEVEL_NAMES = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}

def run_full_analysis(employee_name: str, role: str, assessed_skills: dict):
    required_skills = get_required_skills_for_role(role)

    gaps = []
    met = []

    for skill_info in required_skills:
        skill = skill_info["skill"]
        required_level = skill_info["required_level"]
        importance = skill_info["importance"]

        req_num = LEVEL_MAP.get(required_level, 1)
        emp_level = assessed_skills.get(skill, "Beginner")
        emp_num = LEVEL_MAP.get(emp_level, 1)

        if emp_num < req_num:
            gap_size = req_num - emp_num
            impact_score = round((importance / 100) * gap_size * 100, 1)

            if impact_score >= 50:
                impact_label = "Critical"
            elif impact_score >= 25:
                impact_label = "High"
            else:
                impact_label = "Medium"

            explanation = (
                f"'{skill}' contributes {importance}% to your '{role}' role. "
                f"You are {gap_size} level(s) behind the requirement. "
                f"Fixing this gap will improve your role readiness by {impact_score}%."
            )

            gaps.append({
                "skill": skill,
                "your_level": emp_level,
                "required_level": required_level,
                "gap_size": gap_size,
                "impact_score": impact_score,
                "impact_label": impact_label,
                "role_importance": f"{importance}%",
                "explanation": explanation
            })
        else:
            met.append({
                "skill": skill,
                "your_level": emp_level,
                "required_level": required_level,
                "status": "Met"
            })

    gaps.sort(key=lambda x: x["impact_score"], reverse=True)

    learning_path = []
    total_hours = 0

    for gap in gaps:
        skill = gap["skill"]
        current = gap["your_level"]
        req = gap["required_level"]

        curr_num = LEVEL_MAP.get(current, 1)
        target_num = min(curr_num + 1, LEVEL_MAP.get(req, 2))
        target_level = LEVEL_NAMES.get(target_num, "Intermediate")

        courses = get_ai_course_recommendations(skill, current, target_level, role)

        if courses:
            course = courses[0]
            youtube_url = f"https://www.youtube.com/results?search_query={course['search_query'].replace(' ', '+')}"
            total_hours += course.get("duration_hours", 4)
            learning_path.append({
                "priority": len(learning_path) + 1,
                "skill": skill,
                "your_level": current,
                "target_level": target_level,
                "required_level": req,
                "impact_label": gap["impact_label"],
                "course_title": course["title"],
                "platform": course["platform"],
                "duration_hours": course.get("duration_hours", 4),
                "url": youtube_url,
                "why": gap["explanation"]
            })

    return {
        "employee_name": employee_name,
        "role": role,
        "summary": {
            "total_skills_required": len(required_skills),
            "gaps_found": len(gaps),
            "skills_met": len(met),
            "total_courses": len(learning_path),
            "total_hours": total_hours,
            "estimated_weeks": round(total_hours / 10, 1)
        },
        "gaps": gaps,
        "learning_path": learning_path,
        "skills_met": met
    }
