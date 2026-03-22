from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, ForeignKey("skills.name"))
    difficulty = Column(Integer, nullable=False)
    question_text = Column(String, nullable=False)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_answer = Column(String, nullable=False)

class UserSkillScore(Base):
    __tablename__ = "user_skill_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String, ForeignKey("skills.name"))
    assessed_level = Column(String)
    score = Column(Float)

class EmployeeReport(Base):
    __tablename__ = "employee_reports"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    gaps_found = Column(Integer)
    skills_met = Column(Integer)
    total_courses = Column(Integer)
    total_hours = Column(Integer)
    full_report_json = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_hr = Column(Boolean, default=False)
