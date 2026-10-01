import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import UserDataGrid from "../components/UserDataGrid";
import SearchBar from "../components/SearchBar";

import useSearchFilter from "../hooks/useSearchFilter";
import { sortAscending } from "../utils/classSort";

import "../Styles/ExamSchedule.css";

function ExamSchedule() {
  const navigate = useNavigate();

  const { examId } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [exam, setExam] =
    useState(null);

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingScheduleId,
    setEditingScheduleId,
  ] = useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [formData, setFormData] =
    useState({
      subjectId: "",
      subject: "",
      subjectCode: "",
      date: "",
      startTime: "",
      endTime: "",
    });

  const token =
    localStorage.getItem("token");

  // =========================================================
  // FETCH EXAM
  // =========================================================

  const fetchExam = async () => {
    try {
      const response =
        await fetch(
          `${API}/exams/${examId}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch exam"
        );
      }

      setExam(
        result.data
      );
    } catch (error) {
      console.error(
        "Fetch Exam Error:",
        error
      );

      alert(
        error.message
      );
    }
  };

  // =========================================================
  // FETCH SUBJECTS
  // =========================================================

  const fetchSubjects = async () => {
    try {
      const response =
        await fetch(
          `${API}/subjects`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch subjects"
        );
      }

      setSubjects(
        result.data || []
      );
    } catch (error) {
      console.error(
        "Fetch Subjects Error:",
        error
      );

      alert(
        error.message
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(true);

          await Promise.all([
            fetchExam(),
            fetchSubjects(),
          ]);
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, [examId]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      subjectId: "",
      subject: "",
      subjectCode: "",
      date: "",
      startTime: "",
      endTime: "",
    });

    setEditingScheduleId(
      null
    );

    setShowForm(
      false
    );
  };

  // =========================================================
  // ADD SUBJECT BUTTON
  // =========================================================

  const handleAddSubject = () => {
    setFormData({
      subjectId: "",
      subject: "",
      subjectCode: "",
      date: "",
      startTime: "",
      endTime: "",
    });

    setEditingScheduleId(
      null
    );

    setShowForm(
      true
    );
  };

  // =========================================================
  // SUBJECT CHANGE
  // =========================================================

  const handleSubjectChange = (
    event
  ) => {
    const subjectId =
      event.target.value;

    const selectedSubject =
      subjects.find(
        (subject) =>
          String(subject._id) ===
          String(subjectId)
      );

    setFormData(
      (previous) => ({
        ...previous,

        subjectId:
          selectedSubject?._id ||
          "",

        subject:
          selectedSubject?.subjectName ||
          "",

        subjectCode:
          selectedSubject?.subjectCode ||
          "",
      })
    );
  };

  // =========================================================
  // OTHER FORM CHANGE
  // =========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "-";
    }

    return value.toLocaleDateString(
      "en-GB"
    );
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    row
  ) => {
    const selectedSubject =
      subjects.find(
        (subject) =>
          String(subject._id) ===
          String(row.subjectId)
      );

    setEditingScheduleId(
      row.scheduleId
    );

    setFormData({
      subjectId:
        row.subjectId ||
        selectedSubject?._id ||
        "",

      subject:
        row.subject ||
        selectedSubject?.subjectName ||
        "",

      subjectCode:
        row.subjectCode ||
        selectedSubject?.subjectCode ||
        "",

      date: row.date
        ? new Date(row.date)
            .toISOString()
            .split("T")[0]
        : "",

      startTime:
        row.startTime || "",

      endTime:
        row.endTime || "",
    });

    setShowForm(
      true
    );
  };

  // =========================================================
  // SAVE / UPDATE
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!formData.subjectId) {
      alert(
        "Please select a subject"
      );
      return;
    }

    if (!formData.subject) {
      alert(
        "Subject is required"
      );
      return;
    }

    if (!formData.subjectCode) {
      alert(
        "Subject Code is required"
      );
      return;
    }

    if (!formData.date) {
      alert(
        "Exam Date is required"
      );
      return;
    }

    if (!formData.startTime) {
      alert(
        "Starting Time is required"
      );
      return;
    }

    if (!formData.endTime) {
      alert(
        "End Time is required"
      );
      return;
    }

    if (
      formData.startTime >=
      formData.endTime
    ) {
      alert(
        "End Time must be greater than Starting Time"
      );
      return;
    }

    try {
      const existingSchedule =
        Array.isArray(
          exam?.schedule
        )
          ? exam.schedule
          : [];

      // =====================================================
      // UPDATE EXISTING SCHEDULE
      // =====================================================

      if (editingScheduleId) {
        const response =
          await fetch(
            `${API}/exams/${examId}/schedule/${editingScheduleId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  subject:
                    formData.subject,

                  subjectId:
                    formData.subjectId,

                  subjectCode:
                    formData.subjectCode,

                  date:
                    formData.date,

                  startTime:
                    formData.startTime,

                  endTime:
                    formData.endTime,
                }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to update schedule"
          );
        }

        setExam(
          result.data
        );

        alert(
          "Subject schedule updated successfully"
        );
      }

      // =====================================================
      // ADD NEW SCHEDULE
      // =====================================================

      else {
        const newSchedule = [
          ...existingSchedule,

          {
            subjectId:
              formData.subjectId,

            subject:
              formData.subject,

            subjectCode:
              formData.subjectCode,

            date:
              formData.date,

            startTime:
              formData.startTime,

            endTime:
              formData.endTime,
          },
        ];

        const response =
          await fetch(
            `${API}/exams/${examId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  examType:
                    exam.examType,

                  className:
                    exam.className,

                  academicYear:
                    exam.academicYear,

                  startDate:
                    exam.startDate,

                  endDate:
                    exam.endDate,

                  startTime:
                    exam.startTime,

                  endTime:
                    exam.endTime,

                  status:
                    exam.status,

                  schedule:
                    newSchedule,
                }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to add subject schedule"
          );
        }

        setExam(
          result.data
        );

        alert(
          "Subject schedule added successfully"
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Save Schedule Error:",
        error
      );

      alert(
        error.message
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    row
  ) => {
    if (!row.scheduleId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${row.subject} schedule?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/exams/${examId}/schedule/${row.scheduleId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to delete schedule"
        );
      }

      setExam(
        result.data
      );

      alert(
        "Subject schedule deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete Schedule Error:",
        error
      );

      alert(
        error.message
      );
    }
  };

  // =========================================================
  // DATA GRID ROWS
  // =========================================================

  const rows = useMemo(() => {
    if (!exam?.schedule) {
      return [];
    }

    return exam.schedule.map(
      (
        scheduleItem,
        index
      ) => ({
        id:
          scheduleItem._id ||
          `schedule-${index}`,

        scheduleId:
          scheduleItem._id ||
          null,

        subjectId:
          scheduleItem.subjectId ||
          "",

        subject:
          scheduleItem.subject ||
          "",

        subjectCode:
          scheduleItem.subjectCode ||
          "",

        date:
          scheduleItem.date ||
          "",

        startTime:
          scheduleItem.startTime ||
          "",

        endTime:
          scheduleItem.endTime ||
          "",
      })
    );
  }, [exam]);

  // =========================================================
  // COMMON SEARCH
  // =========================================================

  const filteredRows =
    useSearchFilter(
      rows,
      searchTerm,
      [
        "subject",
        "subjectCode",
        "date",
        "startTime",
        "endTime",
      ]
    );

  // =========================================================
  // COMMON SORTING
  // =========================================================

  const sortedRows =
    sortAscending(
      filteredRows,
      "subject"
    );

  // =========================================================
  // DATA GRID COLUMNS
  // =========================================================

  const columns = [
    {
      field: "subject",

      headerName: "Subject",

      flex: 1.2,

      minWidth: 170,
    },

    {
      field: "subjectCode",

      headerName: "Subject Code",

      flex: 1,

      minWidth: 160,
    },

    {
      field: "date",

      headerName: "Exam Date",

      flex: 1,

      minWidth: 150,

      renderCell: (
        params
      ) => (
        <span>
          {formatDate(
            params.row.date
          )}
        </span>
      ),
    },

    {
      field: "startTime",

      headerName: "Starting Time",

      flex: 1,

      minWidth: 150,
    },

    {
      field: "endTime",

      headerName: "End",

      flex: 1,

      minWidth: 120,
    },

    {
      field: "actions",

      headerName: "Action",

      flex: 1,

      minWidth: 180,

      sortable: false,

      filterable: false,

      renderCell: (
        params
      ) => (
        <div className="exam-schedule-actions">

          <button
            type="button"
            className="exam-schedule-edit-button"
            onClick={() =>
              handleEdit(
                params.row
              )
            }
          >
            Edit
          </button>

          <button
            type="button"
            className="exam-schedule-delete-button"
            onClick={() =>
              handleDelete(
                params.row
              )
            }
          >
            Delete
          </button>

        </div>
      ),
    },
  ];

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate(
      `/dashboard/exams/class/${encodeURIComponent(
        exam?.className || ""
      )}?academicYear=${encodeURIComponent(
        exam?.academicYear || ""
      )}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="exam-schedule-page">

        <div className="exam-schedule-loading">
          Loading exam schedule...
        </div>

      </div>
    );
  }

  // =========================================================
  // EXAM NOT FOUND
  // =========================================================

  if (!exam) {
    return (
      <div className="exam-schedule-page">

        <div className="exam-schedule-empty">
          Exam not found.
        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="exam-schedule-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="exam-schedule-header">

        <div>

          <button
            type="button"
            className="exam-schedule-back-button"
            onClick={handleBack}
          >
            ← Back
          </button>

          <h1>
            {exam.examType}
          </h1>

          <p>
            Class: {exam.className}
          </p>

          <p>
            Academic Year:{" "}
            {exam.academicYear}
          </p>

          <p>
            Exam Date{" "}
            {formatDate(
              exam.startDate
            )}
            {" - "}
            {formatDate(
              exam.endDate
            )}
          </p>

        </div>

      </div>

      {/* =====================================================
          SUBJECT SCHEDULE CARD
      ===================================================== */}

      <CommonCard
        className="exam-schedule-card"
      >

        {/* ===================================================
            TITLE + ADD BUTTON
        =================================================== */}

        <div className="exam-schedule-title-row">

          <div>

            <h2>
              Subject Schedule
            </h2>

            <p>
              Manage subject-wise exam schedule
            </p>

          </div>

          <button
            type="button"
            className="exam-schedule-add-button"
            onClick={
              handleAddSubject
            }
          >
            + Add Subject
          </button>

        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        {rows.length > 0 && (
          <div className="exam-schedule-search">

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search subject or subject code..."
            />

          </div>
        )}

        {/* ===================================================
            ADD / EDIT FORM
        =================================================== */}

        {showForm && (

          <div className="exam-schedule-form-wrapper">

            <div className="exam-schedule-form-header">

              <h3>
                {editingScheduleId
                  ? "Edit Subject"
                  : "Add Subject"}
              </h3>

            </div>

            <form
              className="exam-schedule-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* ================= SUBJECT ================= */}

              <div className="exam-schedule-field">

                <label>
                  Subject
                </label>

                <select
                  name="subjectId"
                  value={
                    formData.subjectId
                  }
                  onChange={
                    handleSubjectChange
                  }
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject._id
                        }
                        value={
                          subject._id
                        }
                      >
                        {
                          subject.subjectName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ============== SUBJECT CODE ================ */}

              <div className="exam-schedule-field">

                <label>
                  Subject Code
                </label>

                <input
                  type="text"
                  value={
                    formData.subjectCode
                  }
                  readOnly
                  placeholder="Subject Code"
                />

              </div>

              {/* ================= DATE ==================== */}

              <div className="exam-schedule-field">

                <label>
                  Exam Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ================ START TIME ================ */}

              <div className="exam-schedule-field">

                <label>
                  Starting Time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={
                    formData.startTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ================= END TIME ================= */}

              <div className="exam-schedule-field">

                <label>
                  End
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={
                    formData.endTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ================= ACTION ================== */}

              <div className="exam-schedule-form-actions">

                <button
                  type="button"
                  className="exam-schedule-cancel-button"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="exam-schedule-save-button"
                >
                  {editingScheduleId
                    ? "Update"
                    : "Add"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* ===================================================
            SEARCH RESULT EMPTY
        =================================================== */}

        {rows.length > 0 &&
          sortedRows.length === 0 && (
            <div className="exam-schedule-empty">

              No schedules found for{" "}

              <strong>
                "{searchTerm}"
              </strong>

            </div>
          )}

        {/* ===================================================
            REUSABLE USER DATA GRID
        =================================================== */}

        <div className="exam-schedule-datagrid">

          <UserDataGrid
            rows={sortedRows}
            columns={columns}
            loading={false}
          />

        </div>

      </CommonCard>

    </div>
  );
}

export default ExamSchedule;