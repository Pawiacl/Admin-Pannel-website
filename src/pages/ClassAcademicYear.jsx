import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/ClassAcademicYear.css";

function ClassAcademicYear() {
  const { classId, section } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // CLASS + SECTION
  // =====================================================

  const className =
    location.state?.className || "Class";

  const decodedSection = decodeURIComponent(
    section || ""
  );

  // =====================================================
  // STATE
  // =====================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ACADEMIC YEARS
  // =====================================================

  useEffect(() => {
    fetchAcademicYears();
  }, [classId, section]);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/data-grid/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Academic Year API Status:",
        response.status
      );

      const result = await response.json();

      console.log(
        "Academic Year API Response:",
        result
      );

      if (!result.success) {
        console.error(
          "Academic Year API failed:",
          result.message
        );

        setAcademicYears([]);
        setStudentCounts({});

        return;
      }

      // =================================================
      // FILTER STUDENTS
      // =================================================

      const selectedClass = className
        .toString()
        .trim()
        .toLowerCase();

      const selectedSection = decodedSection
        .toString()
        .trim()
        .toLowerCase();

      const filteredStudents = result.data.filter(
        (student) => {
          const studentClass =
            student.className
              ?.toString()
              .trim()
              .toLowerCase();

          const studentSection =
            student.section
              ?.toString()
              .trim()
              .toLowerCase();

          const studentAcademicYear =
            student.academicYear
              ?.toString()
              .trim();

          return (
            studentClass === selectedClass &&
            studentSection === selectedSection &&
            Boolean(studentAcademicYear)
          );
        }
      );

      console.log(
        "Selected Class:",
        className
      );

      console.log(
        "Selected Section:",
        decodedSection
      );

      console.log(
        "Filtered Students:",
        filteredStudents
      );

      // =================================================
      // UNIQUE ACADEMIC YEARS
      // =================================================

      const uniqueYears = [
        ...new Set(
          filteredStudents
            .map((student) =>
              student.academicYear
                ?.toString()
                .trim()
            )
            .filter(Boolean)
        ),
      ];

      console.log(
        "Available Academic Years:",
        uniqueYears
      );

      // =================================================
      // STUDENT COUNT FOR EACH YEAR
      // =================================================

      const counts = {};

      uniqueYears.forEach((year) => {
        counts[year] =
          filteredStudents.filter(
            (student) =>
              student.academicYear
                ?.toString()
                .trim()
                .toLowerCase() ===
              year
                .toString()
                .trim()
                .toLowerCase()
          ).length;
      });

      console.log(
        "Academic Year Student Counts:",
        counts
      );

      // =================================================
      // SET DATA
      // =================================================

      setAcademicYears(uniqueYears);
      setStudentCounts(counts);
    } catch (error) {
      console.error(
        "Failed to fetch academic years:",
        error
      );

      setAcademicYears([]);
      setStudentCounts({});
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ACADEMIC YEAR CLICK
  // =====================================================

  const handleAcademicYearClick = (year) => {
    navigate(
      `/dashboard/classes/${classId}/${section}/${encodeURIComponent(
        year
      )}`,
      {
        state: {
          className,
          section: decodedSection,
          academicYear: year,
        },
      }
    );
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(`/dashboard/classes/${classId}`, {
      state: {
        className,
        section: decodedSection,
        sections:
          location.state?.sections || [],
      },
    });
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="class-academic-year-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="class-academic-year-header">

        <button
          type="button"
          className="class-academic-year-back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div className="class-academic-year-title">

          <h1>{className}</h1>

          <p>
            Section {decodedSection}
          </p>

          <span className="academic-year-subtitle">
            Select an academic year
          </span>

        </div>

      </div>

      {/* ================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="academic-year-empty">
          Loading academic years...
        </div>
      )}

      {/* ================================================
          NO ACADEMIC YEAR
      ================================================= */}

      {!loading &&
        academicYears.length === 0 && (
          <div className="academic-year-empty">
            No academic year available
          </div>
        )}

      {/* ================================================
          ACADEMIC YEAR CARDS
      ================================================= */}

      {!loading &&
        academicYears.length > 0 && (
          <div className="academic-year-grid">

            {academicYears.map((year) => (
              <CommonCard
                key={year}
                as="button"
                type="button"
                variant="grid"
                hover
                clickable
                padding={false}
                className="academic-year-card"
                onClick={() =>
                  handleAcademicYearClick(year)
                }
              >
                <div className="academic-year-card-content">

                  <span className="academic-year-label">
                    Academic Year
                  </span>

                  <span className="academic-year-value">
                    {year}
                  </span>

                  <span className="academic-year-student-count">
                    {studentCounts[year] || 0} Students
                  </span>

                </div>

                <span className="academic-year-arrow">
                  →
                </span>
              </CommonCard>
            ))}

          </div>
        )}

    </div>
  );
}

export default ClassAcademicYear;