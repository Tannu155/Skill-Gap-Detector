from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import User
import hashlib

router = APIRouter()

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str):
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    is_hr: bool = False

class LoginInput(BaseModel):
    email: str
    password: str

@router.post("/auth/register")
def register(data: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role="HR Admin" if data.is_hr else "Employee",
        is_hr=data.is_hr
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "Registered successfully!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_hr": user.is_hr
        }
    }

@router.post("/auth/login")
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_hr": user.is_hr
        }
    }

@router.get("/auth/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {
        "users": [
            {"id": u.id, "name": u.name, "email": u.email, "is_hr": u.is_hr}
            for u in users
        ]
    }
