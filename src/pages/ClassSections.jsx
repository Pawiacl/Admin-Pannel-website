import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/ClassSections.css";

function ClassSections() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [className, setClassName] = useState("");
  const [sections, setSections] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH CLASS DETAILS
  // ==========================================

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Class Sections Status:",
        response.status
      );

      const result = await response.json();

      console.log(
        "Class Sections API Response:",
        result
      );

      console.log(
        "All Classes:",
        result.data
      );

      if (!result.success) {
        console.error(
          "Classes API failed:",
          result.message
        );

        setClassName("");
        setSections([]);
        setAcademicYear("");

        return;
      }

      const selectedClass = result.data.find(
        (item) => item._id === classId
      );

      console.log(
        "Selected Class:",
        selectedClass
      );

      if (!selectedClass) {
        console.error(
          "Selected class not found:",
          classId
        );

        setClassName("");
        setSections([]);
        setAcademicYear("");

        return;
      }

      setClassName(
        selectedClass.className || ""
      );

      setSections(
        Array.isArray(selectedClass.sections)
          ? selectedClass.sections
          : []
      );

      setAcademicYear(
        selectedClass.academicYear || ""
      );
    } catch (error) {
      console.error(
        "Failed to fetch class details:",
        error
      );

      setClassName("");
      setSections([]);
      setAcademicYear("");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SECTION CLICK
  // ==========================================

  const handleSectionClick = (section) => {
    navigate(
      `/dashboard/classes/${classId}/${encodeURIComponent(section)}`,
      {
        state: {
          className: className,
          section: section,
          academicYear: academicYear,
        },
      }
    );
  };

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    navigate("/dashboard/classes");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="class-sections-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="class-sections-header">

        <button
          type="button"
          className="class-sections-back-button"
          onClick={handleBack}
        >
          ← Back
        </button>

        <div className="class-sections-title">

          <h1>
            {className}
          </h1>

          <p>
            Select a section
          </p>

        </div>

      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="class-sections-message">
          Loading sections...
        </div>
      )}

      {/* ======================================
          NO SECTIONS
      ====================================== */}

      {!loading && sections.length === 0 && (
        <div className="class-sections-message">
          No sections available
        </div>
      )}

      {/* ======================================
          SECTION CARDS
      ====================================== */}

      {!loading && sections.length > 0 && (
        <div className="class-sections-grid">

          {sections.map((section, index) => (
            <CommonCard
              key={`${section}-${index}`}
              as="button"
              type="button"
              variant="grid"
              hover
              clickable
              padding={false}
              className="class-section-card"
              onClick={() =>
                handleSectionClick(section)
              }
            >

              <span className="class-section-name">
                Section {section}
              </span>

              <span className="section-arrow">
                →
              </span>

            </CommonCard>
          ))}

        </div>
      )}

    </div>
  );
}

export default ClassSections;