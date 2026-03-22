import json
import os

def load_courses():
    path = os.path.join(os.path.dirname(__file__), "../../data/courses.json")
    with open(path, "r") as f:
        return json.load(f)

LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced"]

def get_target_level(current_level: str, required_level: str):
    curr_idx = LEVEL_ORDER.index(current_level) if current_level in LEVEL_ORDER else 0
    req_idx = LEVEL_ORDER.index(required_level) if required_level in LEVEL_ORDER else 0
    if curr_idx >= req_idx:
        return None
    return LEVEL_ORDER[curr_idx + 1]

def recommend_courses(gaps: list):
    courses = load_courses()
    learning_path = []
    total_hours = 0

    for gap in gaps:
        skill = gap["skill"]
        current = gap["your_level"]
        required = gap["required_level"]
        target = get_target_level(current, required)

        if not target:
            continue

        matched = [
            c for c in courses
            if c["skill"].lower() == skill.lower()
            and c["level"].lower() == target.lower()
        ]

        if not matched:
            matched = [
                c for c in courses
                if c["skill"].lower() == skill.lower()
            ]

        if matched:
            course = matched[0]
            total_hours += course["duration_hours"]
            learning_path.append({
                "priority": len(learning_path) + 1,
                "skill": skill,
                "your_level": current,
                "target_level": target,
                "required_level": required,
                "impact_label": gap.get("impact_label", "Medium"),
                "course_title": course["title"],
                "platform": course["platform"],
                "duration_hours": course["duration_hours"],
                "url": course["url"],
                "why": gap.get("explanation", "")
            })

    return {
        "total_courses": len(learning_path),
        "total_hours": total_hours,
        "estimated_weeks": round(total_hours / 10, 1),
        "learning_path": learning_path
    }
