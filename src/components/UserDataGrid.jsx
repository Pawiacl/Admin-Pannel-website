import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

import API from "../services/api";

import "../Styles/UserDataGrid.css";

function UserDataGrid({
  rows: externalRows,
  loading: externalLoading,
  columns,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/data-grid/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch users"
        );
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error(
        "User DataGrid Error:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DATA ONLY WHEN ROWS ARE NOT PASSED
  // =====================================================

  useEffect(() => {
    if (
      externalRows === undefined ||
      externalRows === null
    ) {
      fetchUsers();
    }
  }, []);

  // =====================================================
  // USE EXTERNAL ROWS OR FETCHED USERS
  // =====================================================

  const rows =
    externalRows !== undefined &&
    externalRows !== null
      ? externalRows
      : users;

  const isLoading =
    externalLoading !== undefined
      ? externalLoading
      : loading;

  // =====================================================
  // DATA GRID
  // =====================================================

  return (
    <Box
      className="user-data-grid-wrapper"
      sx={{
        width: "100%",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns || []}
        loading={isLoading}
        getRowId={(row) =>
          row.id || row._id
        }
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
      />
    </Box>
  );
}

export default UserDataGrid;