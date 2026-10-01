import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../Styles/PortalLayout.css";

function PortalLayout() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="portal-layout">

      <Sidebar userType={user?.userType} />

      <main className="portal-content">

        <div className="portal-header">
          <button
            className="portal-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <Outlet />

      </main>

    </div>
  );
}

export default PortalLayout;