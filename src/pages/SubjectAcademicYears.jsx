import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/SubjectAcademicYears.css";

function SubjectAcademicYears() {
  const navigate = useNavigate();

  const { subjectId } = useParams();

  const location = useLocation();

  const [subjectName, setSubjectName] = useState(
    location.state?.subjectName || "Subject"
  );

  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // FETCH SUBJECT
  // =====================================================

  const fetchSubject = async () => {
    try {
      setLoading(true);

      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/subjects/${subjectId}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log("Subject Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch subject"
        );
      }

      const subject = result.data;

      // =================================================
      // SUBJECT NAME
      // =================================================

      setSubjectName(
        subject?.subjectName ||
          location.state?.subjectName ||
          "Subject"
      );

      // =================================================
      // ACADEMIC YEARS
      // =================================================

      const years = Array.isArray(
        subject?.academicYears
      )
        ? subject.academicYears
        : [];

      console.log(
        "Academic Years:",
        years
      );

      setAcademicYears(years);
    } catch (error) {
      console.error(
        "Fetch Subject Error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch subject"
      );

      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD SUBJECT
  // =====================================================

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  // =====================================================
  // SEARCH ACADEMIC YEARS
  // =====================================================

  const filteredAcademicYears =
    useSearchFilter(
      academicYears,
      searchTerm,
      ["academicYear"]
    );

  // =====================================================
  // ACADEMIC YEAR CLICK
  // =====================================================

  const handleAcademicYearClick = (
    academicYear
  ) => {
    if (!academicYear?._id) {
      console.error(
        "Academic Year ID not found:",
        academicYear
      );

      return;
    }

    navigate(
      `/dashboard/subjects/${subjectId}/academic-years/${academicYear._id}/topics`,
      {
        state: {
          subjectName,
          academicYear:
            academicYear.academicYear,
        },
      }
    );
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate("/dashboard/subjects");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="subject-academic-years-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="subject-academic-years-header">

        <div>

          <button
            type="button"
            className="subject-academic-years-back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

          <h1>
            {subjectName}
          </h1>

          <p>
            Academic Years
          </p>

        </div>

      </div>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      {!loading &&
        academicYears.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search academic year..."
          />
        )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="subject-academic-years-error">
          {error}
        </div>
      )}

      {/* =================================================
          CONTENT
      ================================================= */}

      {loading ? (
        <div className="subject-academic-years-loading">
          Loading academic years...
        </div>
      ) : filteredAcademicYears.length === 0 ? (
        <div className="subject-academic-years-empty">
          {searchTerm
            ? "No academic years found."
            : "No academic years found."}
        </div>
      ) : (
        <div className="subject-academic-years-card-grid">

          {filteredAcademicYears.map(
            (academicYear, index) => (
              <CommonCard
                key={
                  academicYear._id ||
                  index
                }
                className="subject-academic-year-card"
                clickable
                hover
                onClick={() =>
                  handleAcademicYearClick(
                    academicYear
                  )
                }
              >

                <div className="subject-academic-year-card-content">

                  <h2>
                    {
                      academicYear.academicYear
                    }
                  </h2>

                  <span className="subject-academic-year-topic-count">

                    {
                      Array.isArray(
                        academicYear.topics
                      )
                        ? academicYear.topics.length
                        : 0
                    }{" "}

                    Topics

                  </span>

                </div>

              </CommonCard>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default SubjectAcademicYears;