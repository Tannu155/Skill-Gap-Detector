from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base
from models import models
from adaptive_test.routes import router as test_router
from gap_analysis.routes import router as gap_router
from recommender.routes import router as recommender_router
from reports.routes import router as reports_router
from neo4j_connection import get_neo4j_session
from auth.routes import router as auth_router
from universal_routes import router as universal_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Skill Gap Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_router, prefix="/api", tags=["Adaptive Test"])
app.include_router(gap_router, prefix="/api", tags=["Gap Analysis"])
app.include_router(recommender_router, prefix="/api", tags=["Recommendations"])
app.include_router(reports_router, prefix="/api", tags=["Reports"])
app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(universal_router, prefix="/api", tags=["Universal"])


@app.get("/")
def home():
    return {"message": "Skill Gap API running!"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}

@app.get("/api/roles")
def get_roles():
    session = get_neo4j_session()
    result = session.run("MATCH (r:Role) RETURN r.name AS role")
    roles = [record["role"] for record in result]
    session.close()
    return {"roles": roles}

@app.get("/api/role/{role_name}/skills")
def get_role_skills(role_name: str):
    session = get_neo4j_session()
    result = session.run("""
        MATCH (r:Role {name: $role})-[req:REQUIRES]->(sk:Skill)
        RETURN sk.name AS skill, req.level AS level
    """, role=role_name)
    skills = [{"skill": r["skill"], "level": r["level"]} for r in result]
    session.close()
    return {"role": role_name, "required_skills": skills}
