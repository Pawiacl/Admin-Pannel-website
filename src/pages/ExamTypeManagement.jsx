import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";

import "../Styles/ExamTypeManagement.css";

function ExamTypeManagement() {
  // =====================================================
  // EXAM TYPES
  // =====================================================

  const [examTypes, setExamTypes] = useState([]);

  // =====================================================
  // FORM
  // =====================================================

  const [examTypeName, setExamTypeName] =
    useState("");

  const [editingExamType, setEditingExamType] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // FETCH EXAM TYPES
  // =====================================================

  const fetchExamTypes = async () => {
    try {
      const response = await fetch(
        `${API}/exam-types`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch exam types"
        );
      }

      setExamTypes(data.data || []);
    } catch (error) {
      console.error(
        "Fetch Exam Types Error:",
        error
      );

      setError(error.message);
    }
  };

  // =====================================================
  // LOAD EXAM TYPES
  // =====================================================

  useEffect(() => {
    fetchExamTypes();
  }, []);

  // =====================================================
  // CLEAR MESSAGE
  // =====================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  const handleOpenCreate = () => {
    clearMessages();

    setEditingExamType(null);
    setExamTypeName("");
    setShowForm(true);
  };

  // =====================================================
  // CREATE EXAM TYPE
  // =====================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!examTypeName.trim()) {
      setError(
        "Exam type name is required"
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/exam-types`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            examTypeName:
              examTypeName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create exam type"
        );
      }

      await fetchExamTypes();

      setExamTypeName("");

      setMessage(
        "Exam type created successfully"
      );

      setShowForm(false);
    } catch (error) {
      console.error(
        "Create Exam Type Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const handleEdit = (examType) => {
    clearMessages();

    setEditingExamType(examType);

    setExamTypeName(
      examType.examTypeName
    );

    setShowForm(true);
  };

  // =====================================================
  // UPDATE EXAM TYPE
  // =====================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!examTypeName.trim()) {
      setError(
        "Exam type name is required"
      );

      return;
    }

    if (!editingExamType?._id) {
      setError(
        "Exam type ID is missing"
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/exam-types/${editingExamType._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            examTypeName:
              examTypeName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update exam type"
        );
      }

      await fetchExamTypes();

      setExamTypeName("");
      setEditingExamType(null);
      setShowForm(false);

      setMessage(
        "Exam type updated successfully"
      );
    } catch (error) {
      console.error(
        "Update Exam Type Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE EXAM TYPE
  // =====================================================

  const handleDelete = async (examType) => {
    clearMessages();

    if (!examType?._id) {
      setError(
        "Exam type ID is missing"
      );

      return;
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${examType.examTypeName}"?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/exam-types/${examType._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete exam type"
        );
      }

      await fetchExamTypes();

      if (
        editingExamType?._id ===
        examType._id
      ) {
        setEditingExamType(null);
        setExamTypeName("");
        setShowForm(false);
      }

      setMessage(
        "Exam type deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete Exam Type Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL FORM
  // =====================================================

  const handleCancel = () => {
    setEditingExamType(null);
    setExamTypeName("");
    setShowForm(false);

    clearMessages();
  };

  // =====================================================
  // EXAM TYPE TABLE ROWS
  // =====================================================

  const examTypeRows = examTypes.map(
    (examType, index) => ({
      id: examType._id,
      serialNumber: index + 1,
      examTypeName:
        examType.examTypeName,
      originalData: examType,
    })
  );

  // =====================================================
  // EXAM TYPE TABLE COLUMNS
  // =====================================================

  const examTypeColumns = [
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0.5,
      minWidth: 80,
    },

    {
      field: "examTypeName",
      headerName: "Exam Type",
      flex: 1,
      minWidth: 200,
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 220,

      sortable: false,
      filterable: false,

      renderCell: (params) => {
        const examType =
          params.row.originalData;

        return (
          <div className="exam-type-grid-actions">
            <button
              type="button"
              className="exam-type-edit-button"
              onClick={() =>
                handleEdit(examType)
              }
            >
              Edit
            </button>

            <button
              type="button"
              className="exam-type-delete-button"
              onClick={() =>
                handleDelete(examType)
              }
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="exam-type-management-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="exam-type-management-header">

        <div>
          <h1>
            Exam Type Management
          </h1>

          <p>
            Manage available exam types
          </p>
        </div>

        {/* CREATE BUTTON */}

        {!showForm && (
          <button
            type="button"
            className="exam-type-create-button"
            onClick={handleOpenCreate}
          >
            + Create
          </button>
        )}

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="exam-type-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="exam-type-error-message">
          {error}
        </div>
      )}

      {/* =================================================
          CREATE / EDIT FORM
      ================================================= */}

      {showForm && (
        <CommonCard
          className="exam-type-form-card"
          title={
            editingExamType
              ? "Edit Exam Type"
              : "Create Exam Type"
          }
          subtitle={
            editingExamType
              ? "Update the exam type"
              : "Add a new exam type"
          }
        >
          <form
            className="exam-type-form"
            onSubmit={
              editingExamType
                ? handleUpdate
                : handleCreate
            }
          >

            {/* EXAM TYPE INPUT */}

            <div className="exam-type-form-group">
              <label>
                Exam Type
              </label>

              <input
                type="text"
                value={examTypeName}
                placeholder="Enter exam type"
                onChange={(event) =>
                  setExamTypeName(
                    event.target.value
                  )
                }
              />
            </div>

            {/* FORM ACTIONS */}

            <div className="exam-type-form-actions">

              <button
                type="button"
                className="exam-type-cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="exam-type-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingExamType
                  ? "Update"
                  : "Create"}
              </button>

            </div>

          </form>
        </CommonCard>
      )}

      {/* =================================================
          EXAM TYPE TABLE
      ================================================= */}

      <CommonCard
        className="exam-type-table-card"
        title="Exam Types"
        subtitle="Available exam types"
      >
        <UserDataGrid
          rows={examTypeRows}
          columns={examTypeColumns}
          loading={loading}
          autoHeight
        />
      </CommonCard>

    </div>
  );
}

export default ExamTypeManagement;