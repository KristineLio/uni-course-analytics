from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="University Course Calculator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Course(BaseModel):
    name: str = Field(min_length=1)
    grade: Optional[float] = Field(default=None, ge=2, le=6)


class Semester(BaseModel):
    name: str = Field(min_length=1)
    untaken_credits: float = Field(default=0, ge=0)
    courses: list[Course]


class AnalyzeRequest(BaseModel):
    semesters: list[Semester]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest):
    semester_results = []
    completed_averages = []

    for semester in payload.semesters:
        graded_courses = [course for course in semester.courses if course.grade is not None]
        all_courses_graded = len(semester.courses) > 0 and len(graded_courses) == len(semester.courses)
        is_completed = semester.untaken_credits == 0 and all_courses_graded

        total_grade = round(sum(course.grade for course in graded_courses if course.grade is not None), 2)
        calculated_courses = len(graded_courses)
        average = round(total_grade / calculated_courses, 2) if calculated_courses else None

        if is_completed and average is not None:
            completed_averages.append(average)

        semester_results.append(
            {
                "semester": semester.name,
                "completed": is_completed,
                "average_grade": average if is_completed else None,
                "courses_num": len(semester.courses),
                "cal_used_courses": calculated_courses if is_completed else 0,
                "total_grade": total_grade if is_completed else None,
                "untaken_credits": semester.untaken_credits,
            }
        )

    overall_average = (
        round(sum(completed_averages) / len(completed_averages), 2)
        if completed_averages
        else None
    )

    return {
        "overall_average_success": overall_average,
        "completed_semesters": len(completed_averages),
        "total_semesters": len(payload.semesters),
        "semesters": semester_results,
    }
