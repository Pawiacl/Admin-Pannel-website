import { useLocation } from "react-router-dom";

import "../Styles/Footer.css";

function Footer() {
  const location = useLocation();

  const isDashboardPage =
    location.pathname.startsWith("/dashboard");

  return (
    <footer
      className={`site-footer ${
        isDashboardPage ? "dashboard-footer" : ""
      }`}
    >
      <div className="footer-content">
        <p>
          Copyright © 2026 Pawia CL Software Development Private Limited
        </p>
      </div>
    </footer>
  );
}

export default Footer;