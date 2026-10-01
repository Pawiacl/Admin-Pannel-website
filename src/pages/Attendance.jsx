import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import { sortByClass } from "../utils/classSort";
import CommonCard from "../components/CommonCard";

import "../Styles/Attendance.css";

function Attendance() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH CLASSES
  // =====================================================

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log(
        "Attendance Classes API Response:",
        result
      );

      if (result.success) {
        // Common class sorting
        // LKG → UKG → 1 → 2 → 3 → ... → A → B → C
        const sortedClasses = sortByClass(
          result.data
        );

        setClasses(sortedClasses);
      } else {
        console.error(
          "Attendance Classes API failed:",
          result.message
        );

        setClasses([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch attendance classes:",
        error
      );

      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLASS CLICK
  // =====================================================

  const handleClassClick = (classData) => {
    navigate(
      `/dashboard/attendance/classes/${classData._id}`,
      {
        state: {
          className: classData.className,
          sections: classData.sections || [],
          academicYear:
            classData.academicYear || "",
        },
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="attendance-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="attendance-header">
        <h1>Attendance</h1>

        <p className="attendance-subtitle">
          Select a class to view attendance
        </p>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="attendance-loading">
          Loading classes...
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading && classes.length === 0 && (
        <div className="attendance-empty">
          No classes available
        </div>
      )}

      {/* =================================================
          CLASS CARDS
      ================================================= */}

      {!loading && classes.length > 0 && (
        <div className="class-cards">
          {classes.map((classData) => (
            <CommonCard
              key={classData._id}
              as="button"
              type="button"
              variant="grid"
              hover
              clickable
              padding={false}
              className="class-card"
              onClick={() =>
                handleClassClick(classData)
              }
            >
              {classData.className}
            </CommonCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default Attendance;