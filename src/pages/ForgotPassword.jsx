import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/login/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Password update failed"
        );

        return;
      }

      setMessage("Password updated successfully");

      setFormData({
        email: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (requestError) {
      console.error(
        "Forgot Password Error:",
        requestError
      );

      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage("");
    setError("");

    navigate("/");
  };

  return (
    <div className="forgot-page">
      <CommonCard
        className="forgot-card"
        variant="rounded"
        padding={false}
      >
        <h1>Forgot Password</h1>

        <p className="forgot-description">
          Enter your registered email address to reset your
          password.
        </p>

        {message && (
          <p
            className="forgot-message"
            role="status"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            className="forgot-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <form
          className="forgot-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>New Password</label>

            <input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          <div>
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          <div className="forgot-button-group">
            <button
              type="submit"
              className="forgot-button"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

            <button
              type="button"
              className="forgot-button"
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

export default ForgotPassword;