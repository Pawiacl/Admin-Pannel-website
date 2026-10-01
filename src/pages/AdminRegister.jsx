import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import CommonCard from "../components/CommonCard";
import "../styles/Register.css";

function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE - temporarily save form data
  const handleSave = () => {
    localStorage.setItem(
      "adminRegistrationDraft",
      JSON.stringify(formData)
    );

    console.log("Admin registration data saved");
  };

  // SUBMIT - send data to API
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API}/registration/admin/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("Admin Registration Response:", data);

      if (response.ok && data.success) {
        localStorage.removeItem("adminRegistrationDraft");

        console.log("Admin registered successfully");

        navigate("/");
      }
    } catch (error) {
      console.error("Admin Registration Error:", error);
    }
  };

  // CANCEL - clear form + navigate to login
  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    localStorage.removeItem("adminRegistrationDraft");

    navigate("/");
  };

  return (
    <div className="register-page">
      <CommonCard
        padding={false}
        className="register-card"
      >
        <h1>Admin Registration</h1>

        <form
          onSubmit={handleRegister}
          className="register-form"
        >
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

          <div>
            <label>Email Address</label>

            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Enter email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

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

export default AdminRegister;