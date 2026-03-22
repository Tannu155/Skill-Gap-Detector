from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_ai_explanation(employee_name: str, role: str, gaps: list, skills_met: list):
    gaps_text = "\n".join([
        f"- {g['skill']}: Currently {g['your_level']}, needs {g['required_level']} (Impact: {g.get('impact_label', 'Medium')})"
        for g in gaps
    ])

    met_text = "\n".join([
        f"- {s['skill']}: Already meets requirement"
        for s in skills_met
    ]) if skills_met else "None"

    prompt = f"""You are an expert HR skill development advisor.

Employee: {employee_name}
Target Role: {role}

Skill Gaps Found:
{gaps_text}

Skills Already Met:
{met_text}

Write a SHORT, personalized, encouraging analysis (max 4 sentences) that:
1. Acknowledges their current strengths
2. Highlights the most critical gap to fix first and why
3. Gives them confidence they can close these gaps
4. Ends with a motivating action step

Be specific, human, and professional. Use their name."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=300
    )

    return response.choices[0].message.content
