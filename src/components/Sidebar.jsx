import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import API from "../services/api";

import "../Styles/Sidebar.css";

function Sidebar({ userType }) {
  
  const [pages, setPages] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // GET PAGES + PERMISSIONS
  // =====================================================

  useEffect(() => {
    if (userType) {
      fetchSidebarData();
    }
  }, [userType]);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // -------------------------------------------------
      // 1. GET ALL ACTIVE PAGES
      // -------------------------------------------------

      const pagesResponse = await fetch(
        `${API}/userTypes/pages/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const pagesResult = await pagesResponse.json();

      if (!pagesResult.success) {
        console.error(
          "Failed to fetch pages:",
          pagesResult.message
        );

        return;
      }

      const allPages = pagesResult.data || [];

      // -------------------------------------------------
      // 2. GET USER TYPE PERMISSIONS
      // -------------------------------------------------

      const permissionResponse = await fetch(
        `${API}/userTypes/${userType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const permissionResult =
        await permissionResponse.json();

      if (!permissionResult.success) {
        console.error(
          "Failed to fetch permissions:",
          permissionResult.message
        );

        return;
      }

      const userPermissions =
        permissionResult.data?.permissions || [];

      // -------------------------------------------------
      // 3. STORE DATA
      // -------------------------------------------------

      setPages(allPages);
      setPermissions(userPermissions);
    } catch (error) {
      console.error(
        "Failed to load sidebar:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER PAGES BY VIEW PERMISSION
  // =====================================================

  const visiblePages = pages.filter((page) => {
    const pagePermission = permissions.find(
      (permission) =>
        permission.pageId?._id === page._id ||
        permission.pageId === page._id
    );

    return pagePermission?.view === true;
  });

  // =====================================================
  // SIDEBAR UI
  // =====================================================

  if (loading) {
    return (
      <aside className="dashboard-sidebar">
        <nav aria-label="Dashboard navigation">
          <ul>
            <li>Loading...</li>
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="dashboard-sidebar">
      <nav aria-label="Dashboard navigation">
        <ul>
          {visiblePages.map((page) => (
            <li key={page._id}>
              <NavLink
                to={page.path}
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                end={page.path === "/dashboard"}
              >
                {page.pageName}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;