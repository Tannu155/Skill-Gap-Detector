import numpy as np

LEVEL_MAP = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}

SKILL_IMPORTANCE = {
    "Data Analyst":  {"Python": 0.35, "SQL": 0.30, "Statistics": 0.25, "Excel": 0.10},
    "Web Developer": {"JavaScript": 0.40, "React": 0.30, "HTML": 0.20, "CSS": 0.10},
    "ML Engineer":   {"Python": 0.35, "Machine Learning": 0.35, "Statistics": 0.20, "Deep Learning": 0.10},
}

def explain_gaps(gaps: list, role: str):
    importance = SKILL_IMPORTANCE.get(role, {})
    explained = []

    for gap in gaps:
        skill = gap["skill"]
        weight = importance.get(skill, 0.1)
        gap_size = gap["gap_size"]
        impact_score = round(weight * gap_size * 100, 1)

        if impact_score >= 50:
            impact_label = "Critical"
        elif impact_score >= 25:
            impact_label = "High"
        else:
            impact_label = "Medium"

        explanation = (
            f"'{skill}' contributes {int(weight*100)}% to your "
            f"'{role}' role. You are {gap['gap_size']} level(s) behind "
            f"the requirement. Fixing this gap will improve your "
            f"role readiness by {impact_score}%."
        )

        explained.append({
            **gap,
            "role_importance": f"{int(weight*100)}%",
            "impact_score": impact_score,
            "impact_label": impact_label,
            "explanation": explanation
        })

    explained.sort(key=lambda x: x["impact_score"], reverse=True)
    return explained
