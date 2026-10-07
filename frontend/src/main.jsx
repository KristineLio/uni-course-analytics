import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const emptyCourse = () => ({ name: "", grade: "" });
const emptySemester = (index) => ({
  name: `Semester ${index + 1} 2026/27`,
  untaken_credits: 0,
  courses: [emptyCourse()],
});

function App() {
  const [semesters, setSemesters] = useState([emptySemester(0)]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateSemester = (semesterIndex, field, value) => {
    setSemesters((current) =>
      current.map((semester, index) =>
        index === semesterIndex ? { ...semester, [field]: value } : semester
      )
    );
  };

  const updateCourse = (semesterIndex, courseIndex, field, value) => {
    setSemesters((current) =>
      current.map((semester, sIndex) => {
        if (sIndex !== semesterIndex) return semester;
        return {
          ...semester,
          courses: semester.courses.map((course, cIndex) =>
            cIndex === courseIndex ? { ...course, [field]: value } : course
          ),
        };
      })
    );
  };

  const addCourse = (semesterIndex) => {
    setSemesters((current) =>
      current.map((semester, index) =>
        index === semesterIndex
          ? { ...semester, courses: [...semester.courses, emptyCourse()] }
          : semester
      )
    );
  };

  const removeCourse = (semesterIndex, courseIndex) => {
    setSemesters((current) =>
      current.map((semester, index) =>
        index === semesterIndex
          ? {
              ...semester,
              courses: semester.courses.filter((_, cIndex) => cIndex !== courseIndex),
            }
          : semester
      )
    );
  };

  const addSemester = () => {
    setSemesters((current) => [...current, emptySemester(current.length)]);
  };

  const removeSemester = (semesterIndex) => {
    setSemesters((current) => current.filter((_, index) => index !== semesterIndex));
  };

  const analyze = async () => {
    setError("");
    setResult(null);

    const payload = {
      semesters: semesters.map((semester) => ({
        ...semester,
        untaken_credits: Number(semester.untaken_credits) || 0,
        courses: semester.courses.map((course) => ({
          name: course.name.trim() || "Unnamed course",
          grade: course.grade === "" ? null : Number(course.grade),
        })),
      })),
    };

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("The API rejected the data. Check that grades are between 2 and 6.");
      }

      setResult(await response.json());
    } catch (err) {
      setError(err.message || "Could not connect to the FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="eyebrow">V1 · React + FastAPI</p>
          <h1>University Academic Calculator</h1>
          <p className="subtitle">
            Enter course grades manually and calculate completed-semester statistics and overall average success.
          </p>
        </div>
        <button className="primary" onClick={analyze} disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="semesters">
        {semesters.map((semester, semesterIndex) => (
          <article className="semester-card" key={semesterIndex}>
            <div className="semester-header">
              <input
                className="semester-title"
                value={semester.name}
                onChange={(e) => updateSemester(semesterIndex, "name", e.target.value)}
                aria-label="Semester name"
              />
              {semesters.length > 1 && (
                <button className="text-button danger" onClick={() => removeSemester(semesterIndex)}>
                  Remove semester
                </button>
              )}
            </div>

            <label className="field compact-field">
              <span>Untaken credits</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={semester.untaken_credits}
                onChange={(e) => updateSemester(semesterIndex, "untaken_credits", e.target.value)}
              />
            </label>

            <div className="course-table">
              <div className="course-row table-head">
                <span>Course</span>
                <span>Grade</span>
                <span></span>
              </div>

              {semester.courses.map((course, courseIndex) => (
                <div className="course-row" key={courseIndex}>
                  <input
                    placeholder="e.g. Data Structures"
                    value={course.name}
                    onChange={(e) =>
                      updateCourse(semesterIndex, courseIndex, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="2"
                    max="6"
                    step="0.01"
                    placeholder="2–6"
                    value={course.grade}
                    onChange={(e) =>
                      updateCourse(semesterIndex, courseIndex, "grade", e.target.value)
                    }
                  />
                  <button
                    className="icon-button"
                    onClick={() => removeCourse(semesterIndex, courseIndex)}
                    disabled={semester.courses.length === 1}
                    title="Remove course"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button className="secondary" onClick={() => addCourse(semesterIndex)}>
              + Add course
            </button>
          </article>
        ))}
      </section>

      <button className="add-semester" onClick={addSemester}>
        + Add semester
      </button>

      {result && (
        <section className="results">
          <div className="summary-grid">
            <div className="metric major">
              <span>Overall average success</span>
              <strong>{result.overall_average_success ?? "—"}</strong>
            </div>
            <div className="metric">
              <span>Completed semesters</span>
              <strong>{result.completed_semesters}</strong>
            </div>
            <div className="metric">
              <span>Total semesters</span>
              <strong>{result.total_semesters}</strong>
            </div>
          </div>

          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>AVG(grade)</th>
                  <th>CoursesNum</th>
                  <th>CalUsedCourses</th>
                  <th>TotalGrade</th>
                </tr>
              </thead>
              <tbody>
                {result.semesters.map((semester) => (
                  <tr key={semester.semester}>
                    <td>{semester.semester}</td>
                    <td>
                      <span className={semester.completed ? "badge success" : "badge pending"}>
                        {semester.completed ? "Completed" : "Incomplete"}
                      </span>
                    </td>
                    <td>{semester.average_grade ?? "—"}</td>
                    <td>{semester.courses_num}</td>
                    <td>{semester.cal_used_courses}</td>
                    <td>{semester.total_grade ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
