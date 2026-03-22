import json
import os
import uuid
from adaptive_test.ai_questions import generate_questions

class AdaptiveTestEngine:
    def __init__(self, skill: str):
        self.skill = skill
        self.current_difficulty = 3
        self.answered_ids = []
        self.responses = []
        self.current_question = None

    def get_next_question(self):
        try:
            questions = generate_questions(
                skill=self.skill,
                difficulty=self.current_difficulty,
                count=1
            )
            q = questions[0]
            question_id = str(uuid.uuid4())[:8]
            self.current_question = {
                "id": question_id,
                "skill": self.skill,
                "difficulty": self.current_difficulty,
                "question": q["question"],
                "options": q["options"],
                "answer": q["answer"],
                "explanation": q.get("explanation", "")
            }
            return self.current_question
        except Exception as e:
            print(f"AI question generation failed: {e}")
            return self._fallback_question()

    def _fallback_question(self):
        fallback_id = str(uuid.uuid4())[:8]
        self.current_question = {
            "id": fallback_id,
            "skill": self.skill,
            "difficulty": self.current_difficulty,
            "question": f"What is a key concept in {self.skill} at difficulty level {self.current_difficulty}?",
            "options": {"A": "Concept A", "B": "Concept B", "C": "Concept C", "D": "Concept D"},
            "answer": "A",
            "explanation": "This is a fallback question."
        }
        return self.current_question

    def submit_answer(self, question_id: str, user_answer: str):
        if not self.current_question:
            return {"error": "No active question"}

        correct_answer = self.current_question["answer"]
        is_correct = user_answer.upper() == correct_answer.upper()

        self.answered_ids.append(question_id)
        self.responses.append({
            "question_id": question_id,
            "difficulty": self.current_difficulty,
            "correct": is_correct,
            "question": self.current_question["question"],
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "explanation": self.current_question.get("explanation", "")
        })

        if is_correct:
            self.current_difficulty = min(5, self.current_difficulty + 1)
        else:
            self.current_difficulty = max(1, self.current_difficulty - 1)

        return {
            "correct": is_correct,
            "correct_answer": correct_answer,
            "explanation": self.current_question.get("explanation", ""),
            "next_difficulty": self.current_difficulty
        }

    def get_result(self):
        if not self.responses:
            return {"level": "Not assessed", "score": 0}

        correct = sum(1 for r in self.responses if r["correct"])
        total = len(self.responses)
        score = round((correct / total) * 100, 2)

        if score >= 70:
            level = "Advanced"
        elif score >= 40:
            level = "Intermediate"
        else:
            level = "Beginner"

        return {
            "skill": self.skill,
            "score": score,
            "level": level,
            "total_questions": total,
            "correct_answers": correct,
            "responses": self.responses
        }
