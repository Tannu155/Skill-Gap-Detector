from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import EmployeeReport
from ai_explainer import generate_ai_explanation
import json

router = APIRouter()

@router.post("/save-report")
def save_report(report: dict, db: Session = Depends(get_db)):
    try:
        ai_explanation = generate_ai_explanation(
            employee_name=report.get("employee_name"),
            role=report.get("role"),
            gaps=report.get("gaps", []),
            skills_met=report.get("skills_met", [])
        )
        report["ai_explanation"] = ai_explanation
    except Exception as e:
        ai_explanation = "AI explanation unavailable."
        report["ai_explanation"] = ai_explanation
        print(f"AI error: {e}")

    new_report = EmployeeReport(
        employee_name=report.get("employee_name"),
        role=report.get("role"),
        gaps_found=report.get("summary", {}).get("gaps_found", 0),
        skills_met=report.get("summary", {}).get("skills_met", 0),
        total_courses=report.get("summary", {}).get("total_courses", 0),
        total_hours=report.get("summary", {}).get("total_hours", 0),
        full_report_json=json.dumps(report)
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "message": "Report saved!",
        "id": new_report.id,
        "ai_explanation": report["ai_explanation"]
    }

@router.get("/all-reports")
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(EmployeeReport).all()
    result = []
    for r in reports:
        data = json.loads(r.full_report_json)
        data["db_id"] = r.id
        result.append(data)
    return {
        "total": len(result),
        "reports": result
    }

@router.delete("/delete-report/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(EmployeeReport).filter(EmployeeReport.id == report_id).first()
    if not report:
        return {"error": "Report not found"}
    db.delete(report)
    db.commit()
    return {"message": f"Report {report_id} deleted successfully"}

@router.delete("/clear-reports")
def clear_reports(db: Session = Depends(get_db)):
    db.query(EmployeeReport).delete()
    db.commit()
    return {"message": "All reports cleared!"}
