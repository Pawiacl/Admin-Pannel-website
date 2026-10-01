import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/ClassTeacherHistory.css";

function ClassTeacherHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const { facultyId } = useParams();

  const [faculty, setFaculty] = useState(
    location.state?.faculty || null
  );

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // FETCH CLASS TEACHER HISTORY
  // =====================================================

  useEffect(() => {
    fetchHistory();
  }, [facultyId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/classTeachers/faculty/${facultyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log(
        "Class Teacher History API Response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to fetch class teacher history"
        );
      }

      setHistory(result.data || []);
    } catch (error) {
      console.error(
        "Class Teacher History Error:",
        error
      );

      setError(
        error.message ||
          "Failed to load class teacher history"
      );

      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT FACULTY NAME
  // =====================================================

  const facultyName = faculty
    ? `${faculty.firstName || ""} ${
        faculty.lastName || ""
      }`.trim()
    : "Faculty";

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredHistory = useSearchFilter(
    history,
    searchTerm,
    [
      "academicYear",
      "fromMonth",
      "toMonth",
      "className",
      "section",
    ]
  );

  // =====================================================
  // SORT
  // =====================================================

  const sortedHistory = sortAscending(
    filteredHistory,
    "academicYear"
  );

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate("/dashboard/faculty");
  };

  // =====================================================
  // DATA GRID COLUMNS
  // =====================================================

  const historyColumns = [
    {
      field: "academicYear",
      headerName: "Academic Year",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return params.row.academicYear || "-";
      },
    },

    {
      field: "fromMonth",
      headerName: "From Month",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return params.row.fromMonth || "-";
      },
    },

    {
      field: "toMonth",
      headerName: "To Month",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return params.row.toMonth || "-";
      },
    },

    {
      field: "className",
      headerName: "Class",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return params.row.className || "-";
      },
    },

    {
      field: "section",
      headerName: "Section",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return params.row.section || "-";
      },
    },
  ];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="class-teacher-history-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="class-teacher-history-header">

        <div>
          <h1>
            Class Teacher History
          </h1>

          <p>
            {facultyName}
          </p>
        </div>

        <button
          type="button"
          className="class-teacher-history-back-button"
          onClick={handleBack}
        >
          Back
        </button>

      </div>

      {/* =================================================
          FACULTY DETAILS
      ================================================= */}

      {faculty && (
        <CommonCard
          padding={false}
          className="class-teacher-faculty-card"
        >

          <div>
            <span>
              Staff ID
            </span>

            <strong>
              {faculty.registrationNumber || "-"}
            </strong>
          </div>

          <div>
            <span>
              Name
            </span>

            <strong>
              {facultyName}
            </strong>
          </div>

          <div>
            <span>
              Email
            </span>

            <strong>
              {faculty.email || "-"}
            </strong>
          </div>

          <div>
            <span>
              Subject
            </span>

            <strong>
              {faculty.subject || "-"}
            </strong>
          </div>

        </CommonCard>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="class-teacher-history-error">
          {error}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="class-teacher-history-loading">
          Loading class teacher history...
        </div>
      )}

      {/* =================================================
          NO RECORDS
      ================================================= */}

      {!loading &&
        !error &&
        history.length === 0 && (
          <div className="class-teacher-history-empty">

            <h3>
              No Class Teacher History
            </h3>

            <p>
              No class teacher assignment
              has been recorded for this
              faculty.
            </p>

          </div>
        )}

      {/* =================================================
          HISTORY DATA GRID
      ================================================= */}

      {!loading &&
        history.length > 0 && (
          <CommonCard
            padding={false}
            className="class-teacher-history-grid-card"
          >

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="class-teacher-history-search">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search class teacher history..."
              />
            </div>

            {/* =================================================
                SEARCH EMPTY
            ================================================= */}

            {sortedHistory.length === 0 ? (
              <div className="class-teacher-history-empty">

                <h3>
                  No Matching Records
                </h3>

                <p>
                  No class teacher history
                  matches your search.
                </p>

              </div>
            ) : (
              <div className="class-teacher-history-grid-container">

                <UserDataGrid
                  rows={sortedHistory}
                  loading={loading}
                  columns={historyColumns}
                />

              </div>
            )}

          </CommonCard>
        )}

    </div>
  );
}

export default ClassTeacherHistory;