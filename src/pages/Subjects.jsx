import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/Subjects.css";

function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH SUBJECTS
  // =====================================================

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API}/subjects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch subjects"
        );
      }

      const subjectList = result.data || [];

      setSubjects(subjectList);
    } catch (error) {
      console.error("Fetch Subjects Error:", error);

      setError(
        error.message || "Failed to fetch subjects"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSubjects = useSearchFilter(
    subjects,
    searchTerm,
    [
      "subjectName",
      "subjectCode",
      "startingYear",
      "endingYear",
    ]
  );

  // =====================================================
  // SORT
  // =====================================================

  const sortedSubjects = sortAscending(
    filteredSubjects,
    "subjectName"
  );

  // =====================================================
  // ADD SUBJECT
  // =====================================================

  const handleAddSubject = () => {
    navigate("/dashboard/subjects/add");
  };

  // =====================================================
  // SUBJECT CARD CLICK
  // =====================================================

  const handleSubjectClick = (subject) => {
    if (!subject?._id) {
      return;
    }

    navigate(
      `/dashboard/subjects/${subject._id}/academic-years`,
      {
        state: {
          subjectName: subject.subjectName,
        },
      }
    );
  };

  // =====================================================
  // EDIT SUBJECT
  // =====================================================

  const handleEditSubject = (event, subject) => {
    event.stopPropagation();

    if (!subject?._id) {
      return;
    }

    navigate("/dashboard/subjects/add", {
      state: {
        editMode: true,
        subject,
      },
    });
  };

  // =====================================================
  // DELETE SUBJECT
  // =====================================================

  const handleDeleteSubject = async (
    event,
    subject
  ) => {
    event.stopPropagation();

    if (!subject?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${subject.subjectName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setDeletingId(subject._id);

      const token = getToken();

      const response = await fetch(
        `${API}/subjects/${subject._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete subject"
        );
      }

      setMessage(
        "Subject deleted successfully."
      );

      setSubjects((previousSubjects) =>
        previousSubjects.filter(
          (item) => item._id !== subject._id
        )
      );
    } catch (error) {
      console.error(
        "Delete Subject Error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete subject"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="subjects-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="subjects-header">

        <div>
          <h1>Subjects</h1>

          <p>
            Manage school subjects
          </p>
        </div>

        <button
          type="button"
          className="subjects-add-button"
          onClick={handleAddSubject}
        >
          + Add Subject
        </button>

      </div>

      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search subject..."
      />

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (
        <div className="subjects-success-message">
          {message}
        </div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="subjects-error-message">
          {error}
        </div>
      )}

      {/* =================================================
          SUBJECT LIST
      ================================================= */}

      {loading ? (
        <div className="subjects-loading">
          Loading subjects...
        </div>
      ) : sortedSubjects.length === 0 ? (
        <div className="subjects-empty">
          No subjects found.
        </div>
      ) : (
        <div className="subjects-card-grid">

          {sortedSubjects.map((subject) => (
            <CommonCard
              key={subject._id}
              className="subject-card"
              hover
              clickable
              onClick={() =>
                handleSubjectClick(subject)
              }
            >

              <div className="subject-card-content">

                {/* =====================================
                    SUBJECT DETAILS
                ===================================== */}

                <div className="subject-card-details">

                  <h2>
                    {subject.subjectName}
                  </h2>

                  <p>
                    Code:{" "}
                    {subject.subjectCode}
                  </p>

                  <p>
                    {subject.startingYear}
                    {" - "}
                    {subject.endingYear}
                  </p>

                </div>

                {/* =====================================
                    ACTIONS
                ===================================== */}

                <div className="subject-card-actions">

                  <button
                    type="button"
                    className="subject-edit-button"
                    onClick={(event) =>
                      handleEditSubject(
                        event,
                        subject
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="subject-delete-button"
                    onClick={(event) =>
                      handleDeleteSubject(
                        event,
                        subject
                      )
                    }
                    disabled={
                      deletingId === subject._id
                    }
                  >
                    {deletingId === subject._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            </CommonCard>
          ))}

        </div>
      )}

    </div>
  );
}

export default Subjects;