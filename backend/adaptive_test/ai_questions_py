from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_questions(skill: str, difficulty: int, count: int = 1):
    difficulty_label = {
        1: "very basic beginner",
        2: "beginner to elementary",
        3: "intermediate",
        4: "upper intermediate",
        5: "advanced expert level"
    }.get(difficulty, "intermediate")

    prompt = f"""Generate {count} multiple choice question(s) about {skill} at {difficulty_label} difficulty.

Return ONLY a valid JSON array with no extra text, no markdown, no backticks.

Format exactly like this:
[
  {{
    "question": "What is...?",
    "options": {{"A": "option1", "B": "option2", "C": "option3", "D": "option4"}},
    "answer": "A",
    "explanation": "Brief explanation why A is correct"
  }}
]

Rules:
- Question must be clear and specific to {skill}
- All 4 options must be plausible
- Only one correct answer
- Difficulty must match {difficulty_label} level
- Return ONLY the JSON array, nothing else"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.7
    )

    text = response.choices[0].message.content.strip()

    try:
        questions = json.loads(text)
        return questions
    except json.JSONDecodeError:
        import re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse AI response: {text}")
