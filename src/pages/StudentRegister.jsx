import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";
import "../styles/Register.css";

function StudentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    classId: "",
    className: "",
    section: "",
    academicYear: "",
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // GET CLASSES
  // =====================================================

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API}/classes`);

      const result = await response.json();

      if (result.success) {
        setClasses(result.data);
      } else {
        setError("Failed to load classes");
      }
    } catch (error) {
      console.error(
        "Class Fetch Error:",
        error
      );

      setError("Unable to load classes");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE CLASS CHANGE
  // =====================================================

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;

    const selectedClass = classes.find(
      (item) => item._id === selectedClassId
    );

    if (!selectedClass) {
      setFormData((previous) => ({
        ...previous,
        classId: "",
        className: "",
        section: "",
      }));

      setSections([]);

      return;
    }

    setFormData((previous) => ({
      ...previous,
      classId: selectedClass._id,
      className: selectedClass.className,
      section: "",
    }));

    setSections(
      selectedClass.sections || []
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/students/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      console.log(
        "Student Registration Response:",
        result
      );

      if (!response.ok) {
        setError(
          result.message ||
            "Student registration failed"
        );

        return;
      }

      if (result.success) {
        alert(
          "Student registered successfully"
        );

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Student Registration Error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      classId: "",
      className: "",
      section: "",
      academicYear: "",
    });

    setSections([]);

    navigate("/");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="register-page">
      <CommonCard
        padding={false}
        className="register-card"
      >
        <h1>Student Registration</h1>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="register-form"
        >
          {/* FIRST NAME */}

          <div>
            <label>First Name</label>

            <input
              className="form-input"
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          {/* LAST NAME */}

          <div>
            <label>Last Name</label>

            <input
              className="form-input"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}

          <div>
            <label>Email Address</label>

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label>Password</label>

            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label>Confirm Password</label>

            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* DATE OF BIRTH */}

          <div>
            <label>Date of Birth</label>

            <input
              className="form-input"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          {/* CLASS */}

          <div>
            <label>Class</label>

            <select
              className="form-input"
              value={formData.classId}
              onChange={handleClassChange}
              required
            >
              <option value="">
                Select Class
              </option>

              {classes.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.className}
                </option>
              ))}
            </select>
          </div>

          {/* ACADEMIC YEAR */}

          <div>
            <label>Academic Year</label>

            <input
              className="form-input"
              type="text"
              name="academicYear"
              placeholder="Eg: 2025-2026"
              value={
                formData.academicYear
              }
              onChange={handleChange}
              required
            />
          </div>

          {/* SECTION */}

          <div>
            <label>Section</label>

            <select
              className="form-input"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
              disabled={!formData.classId}
            >
              <option value="">
                Select Section
              </option>

              {sections.map((section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTONS */}

          <div className="button-group">
            <button
              type="submit"
              className="btn btn-submit"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Complete Registration"}
            </button>

            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </CommonCard>
    </div>
  );
}

export default StudentRegister;