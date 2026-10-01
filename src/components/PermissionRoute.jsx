import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import API from "../services/api";

function PermissionRoute({ pageName, children }) {
  console.log("🔥 PermissionRoute Rendered");
  console.log("🔥 Page Name:", pageName);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const userType = user?.userType?.toLowerCase();

  console.log("🔥 User Type:", userType);

  const [permissionState, setPermissionState] =
    useState({
      loading: true,
      allowed: false,
    });

  // =====================================================
  // CHECK PAGE PERMISSION
  // =====================================================

  useEffect(() => {
    console.log(
      "🚀 PermissionRoute useEffect Started"
    );

    let cancelled = false;

    const fetchPermission = async () => {
      try {
        setPermissionState({
          loading: true,
          allowed: false,
        });

        const token = localStorage.getItem("token");

        console.log(
          "🔑 Token exists:",
          !!token
        );

        console.log(
          "👤 Checking User Type:",
          userType
        );

        console.log(
          "📄 Checking Page:",
          pageName
        );

        // =================================================
        // 1. CHECK LOGIN
        // =================================================

        if (!token || !userType) {
          if (!cancelled) {
            setPermissionState({
              loading: false,
              allowed: false,
            });
          }

          return;
        }

        // =================================================
        // 2. ADMIN FULL ACCESS
        // =================================================

        if (userType === "admin") {
          console.log(
            "👑 Admin detected - Full Access"
          );

          if (!cancelled) {
            setPermissionState({
              loading: false,
              allowed: true,
            });
          }

          return;
        }

        // =================================================
        // 3. GET ALL PAGES
        // =================================================

        const pagesResponse = await fetch(
          `${API}/userTypes/pages/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "📡 Pages API Status:",
          pagesResponse.status
        );

        const pagesResult =
          await pagesResponse.json();

        console.log(
          "📦 Pages API Response:",
          pagesResult
        );

        if (!pagesResponse.ok || !pagesResult.success) {
          throw new Error(
            pagesResult.message ||
              "Failed to fetch pages"
          );
        }

        const pages = pagesResult.data || [];

        console.log(
          "📋 Pages:",
          pages
        );

        // =================================================
        // 4. FIND CURRENT PAGE
        // =================================================

        const currentPage = pages.find(
          (page) =>
            page.pageName?.toLowerCase() ===
            pageName?.toLowerCase()
        );

        console.log(
          "🔍 Current Page:",
          currentPage
        );

        // Page not registered
        if (!currentPage) {
          console.log(
            "❌ Page not found in Page Registry"
          );

          if (!cancelled) {
            setPermissionState({
              loading: false,
              allowed: false,
            });
          }

          return;
        }

        // =================================================
        // 5. GET USER TYPE PERMISSIONS
        // =================================================

        const permissionResponse =
          await fetch(
            `${API}/userTypes/${encodeURIComponent(
              userType
            )}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        console.log(
          "📡 Permission API Status:",
          permissionResponse.status
        );

        const permissionResult =
          await permissionResponse.json();

        console.log(
          "📦 Permission API Response:",
          permissionResult
        );

        if (
          !permissionResponse.ok ||
          !permissionResult.success
        ) {
          throw new Error(
            permissionResult.message ||
              "Failed to fetch permissions"
          );
        }

        const permissions =
          permissionResult.data?.permissions ||
          [];

        console.log(
          "📋 User Permissions:",
          permissions
        );

        // =================================================
        // 6. FIND CURRENT PAGE PERMISSION
        // =================================================

        const pagePermission =
          permissions.find(
            (permission) =>
              permission.pageId?._id ===
                currentPage._id ||
              permission.pageId ===
                currentPage._id
          );

        console.log(
          "🔍 Page Permission:",
          pagePermission
        );

        console.log(
          "👁️ View Permission:",
          pagePermission?.view
        );

        // =================================================
        // 7. CHECK VIEW PERMISSION
        // =================================================

        const hasViewPermission =
          pagePermission?.view === true;

        console.log(
          "🔐 Has View Permission:",
          hasViewPermission
        );

        if (!cancelled) {
          setPermissionState({
            loading: false,
            allowed: hasViewPermission,
          });
        }
      } catch (error) {
        console.error(
          `❌ Failed to check ${pageName} permission:`,
          error
        );

        // Any permission/API error
        // → Do not show Access Denied page
        // → Redirect to Login

        if (!cancelled) {
          setPermissionState({
            loading: false,
            allowed: false,
          });
        }
      }
    };

    fetchPermission();

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      cancelled = true;
    };
  }, [pageName, userType]);

  // =====================================================
  // LOADING
  // =====================================================

  if (permissionState.loading) {
    console.log(
      "⏳ Permission Loading..."
    );

    return null;
  }

  // =====================================================
  // ACCESS DENIED
  // COMMON FOR ALL PAGES
  // =====================================================

  if (!permissionState.allowed) {
    console.log(
      "🚫 Access Denied:",
      pageName
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // =====================================================
  // ACCESS ALLOWED
  // =====================================================

  console.log(
    "✅ Access Allowed:",
    pageName
  );

  return children;
}

export default PermissionRoute;