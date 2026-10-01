import { useEffect, useState } from "react";

import API from "../services/api";

import SearchBar from "../components/SearchBar";
import CommonCard from "../components/CommonCard";
import useSearchFilter from "../hooks/useSearchFilter";

import { sortAscending } from "../utils/classSort";

import "../Styles/Roles.css";

function Roles() {
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("");

  const [pages, setPages] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchUserTypes();
    fetchPages();
  }, []);

  // =====================================================
  // GET USER TYPES
  // =====================================================

  const fetchUserTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/userTypes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const allUserTypes = result.data || [];

        setUserTypes(allUserTypes);

        if (allUserTypes.length > 0) {
          setSelectedUserType(
            allUserTypes[0].userType
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to fetch user types:",
        error
      );
    }
  };

  // =====================================================
  // GET ALL PAGES
  // =====================================================

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/userTypes/pages/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setPages(result.data || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch pages:",
        error
      );
    }
  };

  // =====================================================
  // GET PERMISSIONS
  // =====================================================

  useEffect(() => {
    if (selectedUserType && pages.length > 0) {
      fetchPermissions(selectedUserType);
    }
  }, [selectedUserType, pages]);

  const fetchPermissions = async (userType) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/userTypes/${userType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const existingPermissions =
          result.data.permissions || [];

        const dynamicPermissions = pages.map(
          (page) => {
            const existingPermission =
              existingPermissions.find(
                (permission) =>
                  permission.pageId?._id ===
                    page._id ||
                  permission.pageId === page._id
              );

            return {
              pageId: page._id,
              pageName: page.pageName,
              path: page.path,

              add:
                existingPermission?.add ||
                false,

              edit:
                existingPermission?.edit ||
                false,

              delete:
                existingPermission?.delete ||
                false,

              view:
                existingPermission?.view ||
                false,
            };
          }
        );

        setPermissions(dynamicPermissions);
      }
    } catch (error) {
      console.error(
        "Failed to fetch permissions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMMON SEARCH
  // =====================================================

  const filteredPermissions = useSearchFilter(
    permissions,
    searchTerm,
    ["pageName", "path"]
  );

  // =====================================================
  // COMMON ASCENDING SORT
  // Page Name → Alphabetical / Natural Ascending
  // =====================================================

  const sortedPermissions = sortAscending(
    filteredPermissions,
    "pageName"
  );

  // =====================================================
  // CHANGE PERMISSION
  // =====================================================

  const handlePermissionChange = (
    pageId,
    action
  ) => {
    setPermissions(
      (currentPermissions) =>
        currentPermissions.map(
          (permission) =>
            permission.pageId === pageId
              ? {
                  ...permission,
                  [action]:
                    !permission[action],
                }
              : permission
        )
    );
  };

  // =====================================================
  // SAVE PERMISSIONS
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/userTypes/${selectedUserType}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            permissions: permissions.map(
              (permission) => ({
                pageId: permission.pageId,
                view: permission.view,
                add: permission.add,
                edit: permission.edit,
                delete: permission.delete,
              })
            ),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Permissions saved successfully");

        fetchPermissions(selectedUserType);
      } else {
        alert(
          result.message ||
            "Failed to save permissions"
        );
      }
    } catch (error) {
      console.error(
        "Failed to save permissions:",
        error
      );

      alert("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="roles-page">
      <CommonCard
        title="Roles"
        subtitle="Manage page permissions for each user type"
        className="roles-main-card"
      >
        {/* =============================================
            USER TYPE
        ============================================== */}

        <div className="role-user-type">
          <label htmlFor="userType">
            User Type
          </label>

          <select
            id="userType"
            value={selectedUserType}
            onChange={(event) => {
              setSelectedUserType(
                event.target.value
              );

              setSearchTerm("");
            }}
          >
            <option value="">
              Select User Type
            </option>

            {userTypes.map((userType) => (
              <option
                key={userType._id}
                value={userType.userType}
              >
                {userType.userType}
              </option>
            ))}
          </select>
        </div>

        {/* =============================================
            PERMISSIONS
        ============================================== */}

        {selectedUserType && (
          <div className="roles-table-container">
            {/* =========================================
                COMMON SEARCH BAR
            ========================================== */}

            <div className="roles-search-container">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search pages..."
              />
            </div>

            <table className="roles-table">
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Add</th>
                  <th>Update</th>
                  <th>Delete</th>
                  <th>View</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      Loading permissions...
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No pages found
                    </td>
                  </tr>
                ) : sortedPermissions.length ===
                  0 ? (
                  <tr>
                    <td colSpan="5">
                      No matching pages found
                    </td>
                  </tr>
                ) : (
                  sortedPermissions.map(
                    (permission) => (
                      <tr
                        key={permission.pageId}
                      >
                        <td>
                          {permission.pageName}
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={
                              permission.add
                            }
                            onChange={() =>
                              handlePermissionChange(
                                permission.pageId,
                                "add"
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={
                              permission.edit
                            }
                            onChange={() =>
                              handlePermissionChange(
                                permission.pageId,
                                "edit"
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={
                              permission.delete
                            }
                            onChange={() =>
                              handlePermissionChange(
                                permission.pageId,
                                "delete"
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="checkbox"
                            checked={
                              permission.view
                            }
                            onChange={() =>
                              handlePermissionChange(
                                permission.pageId,
                                "view"
                              )
                            }
                          />
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>

            {/* =========================================
                SAVE BUTTON
            ========================================== */}

            <button
              type="button"
              className="roles-save-button"
              onClick={handleSave}
              disabled={
                saving || !selectedUserType
              }
            >
              {saving
                ? "Saving..."
                : "Save Permissions"}
            </button>
          </div>
        )}
      </CommonCard>
    </div>
  );
}

export default Roles;