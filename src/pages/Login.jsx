import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";
import CommonCard from "../components/CommonCard";

import "../Styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    try {
      const response = await fetch(`${API}/login/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Login Response:", data);

      if (!response.ok || !data.success) {
        setLoginError(
          data.message || "Login failed"
        );

        return;
      }

      // Store Token
      localStorage.setItem(
        "token",
        data.data.token
      );

      // Store User Details + Permissions
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          userType: data.data.userType,
          permissions: data.data.permissions || [],
        })
      );

      console.log("Login successful");
      console.log("User Type:", data.data.userType);
      console.log("Permissions:", data.data.permissions);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      setLoginError(
        "Unable to connect to server"
      );
    }
  };

  return (
    <div className="login-page">

      {/* =============================================
          LOGIN ERROR POPUP
      ============================================= */}

      {loginError && (
        <div className="login-error-overlay">
          <CommonCard
            className="login-error-card"
            variant="rounded"
          >
            <h3>Login Failed</h3>

            <p>{loginError}</p>

            <button
              type="button"
              className="login-error-button"
              onClick={() => setLoginError("")}
            >
              OK
            </button>
          </CommonCard>
        </div>
      )}

      {/* =============================================
          LOGIN CARD
      ============================================= */}

      <CommonCard
        className="login-card"
        variant="rounded"
        padding={false}
      >
        <h1>Bluejay Academic Perf Track Login</h1>

        <form
          onSubmit={handleLogin}
          className="login-form"
        >
          {/* EMAIL */}

          <div>
            <label>Email Address</label>

            <input
              className="login-input"
              type="email"
              placeholder="Enter your email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label>Password</label>

            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
        </form>

        {/* LOGIN LINKS */}

        <div className="login-links">
          <p>Don't have an account?</p>

          <Link to="/admin/register">
            Admin Registration
          </Link>

          <Link to="/faculty/register">
            Faculty Registration
          </Link>

          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </div>
      </CommonCard>
    </div>
  );
}

export default Login;

