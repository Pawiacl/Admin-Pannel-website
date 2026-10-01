import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [isTokenValid, setIsTokenValid] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsTokenValid(false);
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const currentTime = Math.floor(
        Date.now() / 1000
      );

      if (!payload.exp) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsTokenValid(false);
        return;
      }

      const remainingTime =
        (payload.exp - currentTime) * 1000;

      if (remainingTime <= 0) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsTokenValid(false);
        return;
      }

      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", { replace: true });
      }, remainingTime);

      return () => clearTimeout(timer);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setIsTokenValid(false);
    }
  }, [navigate]);

  const token = localStorage.getItem("token");

  if (!token || !isTokenValid) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;