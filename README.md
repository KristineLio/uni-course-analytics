# University Academic Calculator — V1

A small full-stack learning project built with **React + FastAPI**.

V1 deliberately uses **manual course entry** so the frontend/API boundary is easy to understand before adding PDF/DOCX parsing.

## What V1 does

- Add/remove semesters.
- Add/remove courses inside each semester.
- Enter grades manually (Bulgarian 2–6 scale).
- Enter untaken credits for each semester.
- A semester is counted as completed only when:
  - `Untaken credits = 0`, and
  - every course has a grade.
- For completed semesters the API returns:
  - `AVG(grade)`
  - `CoursesNum`
  - `CalUsedCourses`
  - `TotalGrade`
- Overall Average Success = average of the completed semester averages.

## Architecture

```text
React UI
   ↓ POST /api/analyze
FastAPI
   ↓
Calculation / validation
   ↓ JSON
React results dashboard
```

## Run the backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://localhost:8000

FastAPI docs: http://localhost:8000/docs

## Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## REST API

### `GET /api/health`

Returns:

```json
{"status":"ok"}
```

### `POST /api/analyze`

Example request:

```json
{
  "semesters": [
    {
      "name": "Semester 1 2025/26",
      "untaken_credits": 0,
      "courses": [
        {"name": "Data Structures", "grade": 5},
        {"name": "Programming", "grade": 6}
      ]
    }
  ]
}
```

Example response:

```json
{
  "overall_average_success": 5.5,
  "completed_semesters": 1,
  "total_semesters": 1,
  "semesters": [
    {
      "semester": "Semester 1 2025/26",
      "completed": true,
      "average_grade": 5.5,
      "courses_num": 2,
      "cal_used_courses": 2,
      "total_grade": 11.0,
      "untaken_credits": 0
    }
  ]
}
```

## Learning goals

V1 is intentionally focused on:

- React components/state
- controlled HTML forms
- array updates with `map` / `filter`
- `fetch()` and async requests
- REST request/response flow
- FastAPI routes
- Pydantic validation
- CORS
- separating frontend presentation from backend calculations

## Next versions

- **V2:** persistence/database + richer semester analytics
- **V3:** PDF/DOCX upload and parsing
- **V4:** protocol-grade business rules and data-cleaning pipeline
- **V5:** charts, trends and exportable academic report
