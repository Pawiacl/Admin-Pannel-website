import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import { sortByClass } from "../utils/classSort";
import CommonCard from "../components/CommonCard";

import "../Styles/AddExam.css";

function AddExam() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get today's date dynamically in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (currentMonth >= 6) {
      return `${currentYear}-${currentYear + 1}`;
    }

    return `${currentYear - 1}-${currentYear}`;
  };

  const [formData, setFormData] = useState({
    examType: "",
    className: "",
    academicYear: getCurrentAcademicYear(),
    startDate: "",
    endDate: "",
    status: true,
  });

  const token = localStorage.getItem("token");

  // =========================
  // FETCH CLASSES
  // =========================

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${API}/classes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch classes"
        );
      }

      if (result.success) {
        const sortedClasses = sortByClass(
          result.data || []
        );

        setClasses(sortedClasses);
      }
    } catch (error) {
      console.error(
        "Fetch Classes Error:",
        error
      );
    }
  };

  // =========================
  // FETCH EXAM TYPES
  // =========================

  const fetchExamTypes = async () => {
    try {
      const response = await fetch(
        `${API}/exam-types`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch exam types"
        );
      }

      if (result.success) {
        setExamTypes(result.data || []);
      } else {
        setExamTypes([]);
      }
    } catch (error) {
      console.error(
        "Fetch Exam Types Error:",
        error
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchClasses();
    fetchExamTypes();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      examType: "",
      className: "",
      academicYear:
        getCurrentAcademicYear(),
      startDate: "",
      endDate: "",
      status: true,
    });
  };

  // =========================
  // FORM VALIDATION
  // =========================

  const validateForm = () => {
    if (
      !formData.examType ||
      !formData.className ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert(
        "Please fill all required fields"
      );

      return false;
    }

    // Start date cannot be before today
    if (
      new Date(formData.startDate) <
      new Date(getTodayDate())
    ) {
      alert(
        "Start date cannot be in the past"
      );

      return false;
    }

    // End date cannot be before start date
    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      alert(
        "End date cannot be before start date"
      );

      return false;
    }

    return true;
  };

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const examData = {
        ...formData,

        academicYear:
          getCurrentAcademicYear(),

        startTime: "09:00",
        endTime: "12:00",
      };

      const response = await fetch(
        `${API}/exams`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            examData
          ),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to create exam"
        );
      }

      alert(
        "Exam created successfully"
      );

      resetForm();

      navigate(
        "/dashboard/exams"
      );
    } catch (error) {
      console.error(
        "Create Exam Error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    resetForm();

    navigate(
      "/dashboard/exams"
    );
  };

  return (
    <div className="exam-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="exam-header">
        <div>
          <h1>Add Exam</h1>

          <p>
            Add a new school examination
          </p>
        </div>
      </div>

      {/* =========================
          EXAM FORM
      ========================= */}

      <CommonCard
        className="exam-form-card"
        title="Add Exam"
        subtitle="Add a new school examination."
      >
        <form onSubmit={handleSubmit}>

          <div className="exam-form-grid">

            {/* =========================
                EXAM TYPE
            ========================= */}

            <div className="exam-form-group">

              <label>
                Exam Type
              </label>

              <select
                name="examType"
                value={
                  formData.examType
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select Exam Type
                </option>

                {examTypes.map(
                  (examType) => (
                    <option
                      key={
                        examType._id
                      }
                      value={
                        examType.examTypeName
                      }
                    >
                      {
                        examType.examTypeName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            {/* =========================
                CLASS NAME
            ========================= */}

            <div className="exam-form-group">

              <label>
                Class Name
              </label>

              <select
                name="className"
                value={
                  formData.className
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select Class
                </option>

                {classes.map(
                  (classData) => (
                    <option
                      key={
                        classData._id
                      }
                      value={
                        classData.className
                      }
                    >
                      {
                        classData.className
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            {/* =========================
                START DATE
            ========================= */}

            <div className="exam-form-group">

              <label>
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={
                  formData.startDate
                }
                min={getTodayDate()}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* =========================
                END DATE
            ========================= */}

            <div className="exam-form-group">

              <label>
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={
                  formData.endDate
                }
                min={
                  formData.startDate ||
                  getTodayDate()
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* =========================
                STATUS
            ========================= */}

            <div className="exam-form-group exam-status-group">

              <label>
                Status
              </label>

              <label className="exam-checkbox-label">

                <input
                  type="checkbox"
                  name="status"
                  checked={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                />

                Active

              </label>

            </div>

          </div>

          {/* =========================
              FORM ACTIONS
          ========================= */}

          <div className="exam-form-actions">

            <button
              type="button"
              className="exam-cancel-button"
              onClick={
                handleCancel
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="exam-submit-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Submit"}
            </button>

          </div>

        </form>
      </CommonCard>

    </div>
  );
}

export default AddExam;