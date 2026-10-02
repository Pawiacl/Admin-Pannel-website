import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import CommonCard from "../components/CommonCard";
import "../Styles/Register.css";

function FacultyRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    subject: "",
    academicYear: "",
  });

  const [subjects, setSubjects] = useState([]);

  // =====================================================
  // FETCH SUBJECTS
  // =====================================================

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `${API}/subjects/public`
        );

        const data = await response.json();

        console.log("Subjects Response:", data);

        if (response.ok && data.success) {
          setSubjects(data.data || []);
        }
      } catch (error) {
        console.error(
          "Fetch Subjects Error:",
          error
        );
      }
    };

    fetchSubjects();
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // SAVE
  // Temporarily save faculty registration data
  // =====================================================

  const handleSave = () => {
    localStorage.setItem(
      "facultyRegistrationDraft",
      JSON.stringify(formData)
    );

    console.log(
      "Faculty registration data saved"
    );
  };

  // =====================================================
  // COMPLETE REGISTRATION
  // Send faculty data to Registration Service
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API}/registration/faculty/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log(
        "Faculty Registration Response:",
        data
      );

      if (response.ok && data.success) {
        localStorage.removeItem(
          "facultyRegistrationDraft"
        );

        console.log(
          "Faculty registered successfully"
        );

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Faculty Registration Error:",
        error
      );
    }
  };

  // =====================================================
  // CANCEL
  // Clear form and go to Login
  // =====================================================

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      subject: "",
      academicYear: "",
    });

    localStorage.removeItem(
      "facultyRegistrationDraft"
    );

    navigate("/");
  };

  return (
    <div className="register-page">
      <CommonCard
        padding={false}
        className="register-card"
      >
        <h1>Faculty Registration</h1>

        <form
          onSubmit={handleRegister}
          className="register-form"
        >
          {/* =================================================
              FIRST NAME
          ================================================= */}

          <div>
            <label>First Name</label>

            <input
              className="form-input"
              type="text"
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              LAST NAME
          ================================================= */}

          <div>
            <label>Last Name</label>

            <input
              className="form-input"
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label>Email Address</label>

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>
            <label>Password</label>

            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div>
            <label>Confirm Password</label>

            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              SUBJECT - DYNAMIC
          ================================================= */}

          <div>
            <label>Subject</label>

            <select
              className="form-input"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            >
              <option value="">
                Select subject
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject._id}
                  value={subject.subjectName}
                >
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              ACADEMIC YEAR
          ================================================= */}

          <div>
            <label>Academic Year</label>

            <input
              className="form-input"
              type="text"
              name="academicYear"
              placeholder="Example: 2026-2027"
              value={formData.academicYear}
              onChange={handleChange}
            />
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="button-group">
            <button
              type="button"
              className="btn btn-save"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              type="submit"
              className="btn btn-submit"
            >
              Complete Registration
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

export default FacultyRegister;