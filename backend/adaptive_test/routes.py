from fastapi import APIRouter
from pydantic import BaseModel
from adaptive_test.engine import AdaptiveTestEngine

router = APIRouter()
active_sessions = {}

class AnswerInput(BaseModel):
    session_id: str
    question_id: str
    answer: str

@router.post("/test/start/{skill}")
def start_test(skill: str):
    import uuid
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

@router.post("/test/answer")
def submit_answer(data: AnswerInput):
    engine = active_sessions.get(data.session_id)
    if not engine:
        return {"error": "Session not found. Start a new test."}

    result = engine.submit_answer(data.question_id, data.answer)
    
    if len(engine.responses) >= 5:
        final = engine.get_result()
        del active_sessions[data.session_id]
        return {
            "status": "completed",
            "result": final,
            "feedback": result
        }

    next_q = engine.get_next_question()
    return {
        "status": "ongoing",
        "feedback": result,
        "next_question": next_q
    }
