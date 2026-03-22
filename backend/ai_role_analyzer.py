from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_required_skills_for_role(role: str):
    prompt = f"""You are an expert HR skills analyst.

For the job role: "{role}"

Return ONLY a valid JSON array of the top 4-5 most important skills required.
No extra text, no markdown, no backticks.

Format exactly like this:
[
  {{"skill": "Python", "required_level": "Intermediate", "importance": 35}},
  {{"skill": "SQL", "required_level": "Intermediate", "importance": 30}},
  {{"skill": "Excel", "required_level": "Basic", "importance": 20}},
  {{"skill": "Statistics", "required_level": "Intermediate", "importance": 15}}
]

Rules:
- "skill" must be a specific technical or professional skill
- "required_level" must be exactly one of: "Basic", "Intermediate", "Advanced"
- "importance" is a percentage, all must add up to 100
- Return ONLY the JSON array, nothing else
- Skills must be realistic for the role: {role}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.3
    )

    text = response.choices[0].message.content.strip()

    try:
        skills = json.loads(text)
        return skills
    except json.JSONDecodeError:
        import re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse AI response: {text}")


def get_ai_course_recommendations(skill: str, current_level: str, target_level: str, role: str):
    prompt = f"""You are an expert learning advisor.

Employee Role: {role}
Skill to improve: {skill}
Current level: {current_level}
Target level: {target_level}

Suggest 2 specific learning resources. Return ONLY a valid JSON array.
No extra text, no markdown, no backticks.

Format exactly like this:
[
  {{
    "title": "Specific course or resource title",
    "platform": "YouTube/Coursera/Khan Academy/Google/Udemy",
    "duration_hours": 5,
    "type": "Video Course",
    "search_query": "exact youtube search query to find this"
  }}
]

Rules:
- Suggest REAL, well-known courses that actually exist
- Make search_query specific enough to find on YouTube
- duration_hours should be realistic
- Return ONLY the JSON array"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.3
    )

    text = response.choices[0].message.content.strip()

    try:
        courses = json.loads(text)
        return courses
    except json.JSONDecodeError:
        import re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return []
