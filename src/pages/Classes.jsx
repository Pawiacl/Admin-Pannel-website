import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import { sortByClass } from "../utils/classSort";
import CommonCard from "../components/CommonCard";

import "../Styles/Classes.css";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

      console.log("Classes API Response:", result);

      if (result.success) {
        const sortedClasses = sortByClass(result.data);

        setClasses(sortedClasses);
      } else {
        console.error(
          "Classes API failed:",
          result.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch classes:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classData) => {
    navigate(`/dashboard/classes/${classData._id}`, {
      state: {
        className: classData.className,
        sections: classData.sections || [],
        academicYear: classData.academicYear || "",
      },
    });
  };

  return (
    <div className="classes-page">
      {/* PAGE HEADER */}
      <div className="classes-header">
        <h1>Classes</h1>

        <p className="classes-subtitle">
          Select a class to continue
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="classes-loading">
          Loading classes...
        </div>
      )}

      {/* EMPTY */}
      {!loading && classes.length === 0 && (
        <div className="classes-empty">
          No classes available
        </div>
      )}

      {/* CLASS GRID */}
      {!loading && classes.length > 0 && (
        <div className="classes-grid">
          {classes.map((classData) => (
            <CommonCard
              key={classData._id}
              variant="grid"
              hover
              clickable
              padding={false}
              onClick={() =>
                handleClassClick(classData)
              }
              className="class-card"
            >
              {classData.className}
            </CommonCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default Classes;