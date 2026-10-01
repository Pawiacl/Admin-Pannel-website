import { useEffect, useState } from "react";

import API from "../services/api";
import UserDataGrid from "../components/UserDataGrid";
import CommonCard from "../components/CommonCard";
import SearchBar from "../components/SearchBar";

import { sortByClass } from "../utils/classSort";
import useSearchFilter from "../hooks/useSearchFilter";

import "../Styles/Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // COMMON SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // EDIT STATE
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
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

      if (result.success) {
        const studentUsers = result.data
          .filter(
            (user) =>
              user.userType?.toLowerCase() ===
              "student"
          )
          .map((user) => ({
            _id: user._id,

            userId: user.userId,

            firstName: user.firstName || "",

            lastName: user.lastName || "",

            email: user.email || "",

            dateOfBirth:
              user.dateOfBirth || "",

            classId: user.classId || "",

            className:
              user.className || "",

            section: user.section || "",

            rollNumber:
              user.rollNumber || "",
          }));

        // =================================================
        // COMMON CLASS SORTING
        // =================================================
        // LKG → UKG → 1 → 2 → 3 → ... → 10 → 11 → 12
        //
        // Same class:
        // Roll Number → 1 → 2 → 3 → 4...
        // =================================================

        const sortedStudents =
          sortByClass(studentUsers);

        setStudents(sortedStudents);
      }
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMMON SEARCH FILTER
  // =====================================================

  const filteredStudents =
    useSearchFilter(
      students,
      searchTerm,
      [
        "firstName",
        "lastName",
        "email",
        "className",
        "section",
        "rollNumber",
      ]
    );

  // =====================================================
  // COUNTS
  // =====================================================

  const totalStudents = students.length;

  const totalRollNumbers = students.filter(
    (student) =>
      student.rollNumber !== null &&
      student.rollNumber !== undefined &&
      student.rollNumber !== ""
  ).length;

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleEdit = (student) => {
    setEditingStudent({
      ...student,
    });

    setMessage("");
    setShowEditForm(true);
  };

  // =====================================================
  // CLOSE EDIT FORM
  // =====================================================

  const handleCancelEdit = () => {
    setEditingStudent(null);

    setShowEditForm(false);

    setMessage("");
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleEditChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditingStudent(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =====================================================
  // UPDATE STUDENT
  // =====================================================

  const handleSaveStudent = async (e) => {
    e.preventDefault();

    if (!editingStudent?._id) {
      setMessage("Student ID not found");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API}/students/${editingStudent._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            firstName:
              editingStudent.firstName,

            lastName:
              editingStudent.lastName,

            email:
              editingStudent.email,

            dateOfBirth:
              editingStudent.dateOfBirth,

            classId:
              editingStudent.classId,

            className:
              editingStudent.className,

            section:
              editingStudent.section,

            rollNumber:
              editingStudent.rollNumber || "",
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update student"
        );
      }

      setMessage(
        "Student updated successfully"
      );

      await fetchStudents();

      setTimeout(() => {
        setEditingStudent(null);
        setShowEditForm(false);
        setMessage("");
      }, 800);
    } catch (error) {
      console.error(
        "Update Student Error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to update student"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DATA GRID COLUMNS
  // =====================================================

  const studentColumns = [
    {
      field: "rollNumber",
      headerName: "Roll Number",
      flex: 1,
      minWidth: 120,

      renderCell: (params) => {
        return (
          <span>
            {params.value || "-"}
          </span>
        );
      },
    },

    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 130,
    },

    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: "dateOfBirth",
      headerName: "Date Of Birth",
      flex: 1,
      minWidth: 140,

      valueFormatter: (value) => {
        if (!value) {
          return "";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
          return "";
        }

        const day = String(
          date.getDate()
        ).padStart(2, "0");

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");

        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
      },
    },

    {
      field: "className",
      headerName: "Class Name",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "section",
      headerName: "Section",
      flex: 1,
      minWidth: 100,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => (
        <button
          type="button"
          className="student-edit-button"
          onClick={() =>
            handleEdit(params.row)
          }
        >
          Edit
        </button>
      ),
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="students-page">

      <h1>Students</h1>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="students-summary">

        <CommonCard
          variant="summary"
          padding={false}
          className="student-summary-card"
        >
          <span className="student-summary-title">
            Total Students
          </span>

          <span className="student-summary-count">
            {totalStudents}
          </span>
        </CommonCard>

        <CommonCard
          variant="summary"
          padding={false}
          className="student-summary-card"
        >
          <span className="student-summary-title">
            Total Roll Numbers
          </span>

          <span className="student-summary-count">
            {totalRollNumbers}
          </span>
        </CommonCard>

      </div>

      {/* =================================================
          COMMON SEARCH
      ================================================= */}

      <div className="students-search-container">

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search students..."
        />

      </div>

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {showEditForm &&
        editingStudent && (
          <div className="student-edit-overlay">

            <CommonCard
              className="student-edit-modal"
              title="Edit Student"
              actions={
                <button
                  type="button"
                  className="student-edit-close"
                  onClick={
                    handleCancelEdit
                  }
                >
                  ×
                </button>
              }
            >
              <form
                onSubmit={
                  handleSaveStudent
                }
                className="student-edit-form"
              >

                {/* FIRST NAME */}

                <div className="student-form-group">

                  <label>
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={
                      editingStudent.firstName
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* LAST NAME */}

                <div className="student-form-group">

                  <label>
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={
                      editingStudent.lastName
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="student-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      editingStudent.email
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* DATE OF BIRTH */}

                <div className="student-form-group">

                  <label>
                    Date Of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      editingStudent.dateOfBirth
                        ? new Date(
                            editingStudent.dateOfBirth
                          )
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* CLASS NAME */}

                <div className="student-form-group">

                  <label>
                    Class Name
                  </label>

                  <input
                    type="text"
                    name="className"
                    value={
                      editingStudent.className
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* SECTION */}

                <div className="student-form-group">

                  <label>
                    Section
                  </label>

                  <input
                    type="text"
                    name="section"
                    value={
                      editingStudent.section
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* ROLL NUMBER */}

                <div className="student-form-group">

                  <label>
                    Roll Number
                  </label>

                  <input
                    type="text"
                    name="rollNumber"
                    value={
                      editingStudent.rollNumber ||
                      ""
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="Enter roll number"
                  />

                </div>

                {/* MESSAGE */}

                {message && (
                  <div
                    className={
                      message.includes(
                        "successfully"
                      )
                        ? "student-edit-success"
                        : "student-edit-error"
                    }
                  >
                    {message}
                  </div>
                )}

                {/* BUTTONS */}

                <div className="student-edit-actions">

                  <button
                    type="button"
                    className="student-cancel-button"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="student-save-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>
            </CommonCard>

          </div>
        )}

      {/* =================================================
          COMMON DATA GRID
      ================================================= */}

      <UserDataGrid
        rows={filteredStudents}
        loading={loading}
        columns={studentColumns}
      />

    </div>
  );
}

export default Students;