import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/Faculty.css";

function Faculty() {
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // =====================================================
  // INACTIVE REMARKS MODAL
  // =====================================================

  const [remarksModal, setRemarksModal] = useState({
    open: false,
    facultyId: null,
    currentRemarks: "",
  });

  const [remarks, setRemarks] = useState("");
  const [savingRemarks, setSavingRemarks] = useState(false);

  // =====================================================
  // FETCH FACULTY
  // =====================================================

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
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

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch faculty"
        );
      }

      const facultyUsers = (result.data || []).filter(
        (user) =>
          user.userType?.toLowerCase() === "faculty"
      );

      setFaculty(facultyUsers);
    } catch (error) {
      console.error(
        "Failed to fetch faculty:",
        error
      );

      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredFaculty = useSearchFilter(
    faculty,
    searchText,
    [
      "registrationNumber",
      "firstName",
      "lastName",
      "email",
      "subject",
      "academicYear",
      "status",
      "remarks",
    ]
  );

  // =====================================================
  // COMMON SORTING
  //
  // Faculty Name:
  // First Name → Ascending
  // =====================================================

  const sortedFaculty = sortAscending(
    filteredFaculty,
    "firstName"
  );

  // =====================================================
  // UPDATE FACULTY STATUS API
  // =====================================================

  const updateFacultyStatus = async (
    facultyId,
    newStatus,
    remarksValue
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/registration/faculty/${facultyId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
            remarks: remarksValue,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "Failed to update faculty status."
        );

        return false;
      }

      await fetchFaculty();

      return true;
    } catch (error) {
      console.error(
        "Faculty Status Update Error:",
        error
      );

      alert("Failed to update faculty status.");

      return false;
    }
  };

  // =====================================================
  // FACULTY STATUS CHANGE
  // =====================================================

  const handleStatusChange = (
    facultyId,
    newStatus,
    currentRemarks
  ) => {
    // =========================
    // ACTIVE
    // =========================

    if (newStatus === true) {
      updateFacultyStatus(
        facultyId,
        true,
        ""
      );

      return;
    }

    // =========================
    // INACTIVE
    // =========================

    setRemarks(currentRemarks || "");

    setRemarksModal({
      open: true,
      facultyId: facultyId,
      currentRemarks:
        currentRemarks || "",
    });
  };

  // =====================================================
  // SAVE INACTIVE REMARKS
  // =====================================================

  const handleSaveInactive = async () => {
    const trimmedRemarks =
      remarks.trim();

    if (!trimmedRemarks) {
      return;
    }

    try {
      setSavingRemarks(true);

      const success =
        await updateFacultyStatus(
          remarksModal.facultyId,
          false,
          trimmedRemarks
        );

      if (success) {
        setRemarksModal({
          open: false,
          facultyId: null,
          currentRemarks: "",
        });

        setRemarks("");
      }
    } finally {
      setSavingRemarks(false);
    }
  };

  // =====================================================
  // CANCEL REMARKS MODAL
  // =====================================================

  const handleCancelRemarks = () => {
    setRemarksModal({
      open: false,
      facultyId: null,
      currentRemarks: "",
    });

    setRemarks("");
  };

  // =====================================================
  // CREATE CLASS TEACHER
  // =====================================================

  const handleCreateClassTeacher = () => {
    navigate(
      "/dashboard/faculty/assign-class-teacher"
    );
  };

  // =====================================================
  // VIEW CLASS TEACHER HISTORY
  // =====================================================

  const handleViewClassTeacher = (faculty) => {
    navigate(
      `/dashboard/faculty/${faculty._id}/class-teacher`,
      {
        state: {
          faculty: {
            id: faculty._id,

            firstName:
              faculty.firstName,

            lastName:
              faculty.lastName,

            registrationNumber:
              faculty.registrationNumber,

            email:
              faculty.email,

            subject:
              faculty.subject,
          },
        },
      }
    );
  };

  // =====================================================
  // DATAGRID COLUMNS
  // =====================================================

  const columns = [
    // =====================================
    // STAFF ID
    // =====================================

    {
      field: "registrationNumber",
      headerName: "Staff ID",
      flex: 1,
      minWidth: 120,
    },

    // =====================================
    // FIRST NAME
    // =====================================

    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 130,
    },

    // =====================================
    // LAST NAME
    // =====================================

    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 130,
    },

    // =====================================
    // EMAIL
    // =====================================

    {
      field: "email",
      headerName: "Email",
      flex: 1.4,
      minWidth: 210,
    },

    // =====================================
    // SUBJECT
    // =====================================

    {
      field: "subject",
      headerName: "Subject",
      flex: 1,
      minWidth: 150,
    },

    // =====================================
    // CLASS TEACHER
    // =====================================

    {
      field: "classTeacher",
      headerName: "Class Teacher",
      flex: 0.9,
      minWidth: 140,
      sortable: false,
      filterable: false,

      renderCell: (params) => {
        return (
          <button
            type="button"
            className="faculty-class-teacher-view-button"
            onClick={() =>
              handleViewClassTeacher(
                params.row
              )
            }
          >
            View
          </button>
        );
      },
    },

    // =====================================
    // ACADEMIC YEAR
    // =====================================

    {
      field: "academicYear",
      headerName: "Academic Year",
      flex: 1,
      minWidth: 140,
    },

    // =====================================
    // STATUS
    // =====================================

    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 130,

      renderCell: (params) => {
        const isActive =
          params.row.status === true;

        return (
          <select
            value={
              isActive
                ? "Active"
                : "Inactive"
            }
            onChange={(e) => {
              const newStatus =
                e.target.value ===
                "Active";

              handleStatusChange(
                params.row._id,
                newStatus,
                params.row.remarks
              );
            }}
            className={
              isActive
                ? "faculty-status-select faculty-status-active"
                : "faculty-status-select faculty-status-inactive"
            }
          >
            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        );
      },
    },

    // =====================================
    // REMARKS
    // =====================================

    {
      field: "remarks",
      headerName: "Remarks",
      flex: 1.2,
      minWidth: 200,

      renderCell: (params) => {
        const isActive =
          params.row.status === true;

        return (
          <span
            className={
              isActive
                ? "faculty-remarks-disabled"
                : "faculty-remarks-text"
            }
            title={
              isActive
                ? ""
                : params.row.remarks || ""
            }
          >
            {isActive
              ? ""
              : params.row.remarks || ""}
          </span>
        );
      },
    },
  ];

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <div className="faculty-page">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="faculty-page-header">
        <h1>Faculty</h1>

        <button
          type="button"
          className="faculty-create-button"
          onClick={
            handleCreateClassTeacher
          }
        >
          Assign
        </button>
      </div>

      {/* ==========================================
          COMMON SEARCH BAR
      ========================================== */}

      <div className="faculty-search-container">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search faculty..."
        />
      </div>

      {/* ==========================================
          COMMON USER DATA GRID
      ========================================== */}

      <UserDataGrid
        rows={sortedFaculty}
        columns={columns}
        loading={loading}
      />

      {/* ==========================================
          INACTIVE FACULTY REMARKS MODAL
      ========================================== */}

      {remarksModal.open && (
        <div className="faculty-modal-overlay">

          <CommonCard
            className="remarks-modal-card"
            title="Mark Faculty as Inactive"
            subtitle="Please enter the reason for marking this faculty as inactive."
          >

            <div className="faculty-remarks-content">

              <label htmlFor="faculty-remarks">
                Remarks
              </label>

              <textarea
                id="faculty-remarks"
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
                placeholder="Enter remarks..."
                rows={4}
                autoFocus
              />

              <div className="faculty-modal-actions">

                <button
                  type="button"
                  className="faculty-modal-cancel"
                  onClick={
                    handleCancelRemarks
                  }
                  disabled={
                    savingRemarks
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="faculty-modal-submit"
                  onClick={
                    handleSaveInactive
                  }
                  disabled={
                    !remarks.trim() ||
                    savingRemarks
                  }
                >
                  {savingRemarks
                    ? "Saving..."
                    : "Submit"}
                </button>

              </div>

            </div>

          </CommonCard>

        </div>
      )}
    </div>
  );
}

export default Faculty;