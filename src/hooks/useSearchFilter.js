import { useMemo } from "react";

function useSearchFilter(
  data = [],
  searchTerm = "",
  searchFields = []
) {
  const filteredData = useMemo(() => {
    // Make sure data is an array
    if (!Array.isArray(data)) {
      return [];
    }

    // Remove extra spaces and convert search text to lowercase
    const searchValue = String(searchTerm || "")
      .toLowerCase()
      .trim();

    // If search box is empty, return all data
    if (!searchValue) {
      return data;
    }

    // Filter data based on the provided fields
    return data.filter((item) => {
      // Search in all object values when no fields are provided
      if (!Array.isArray(searchFields) || searchFields.length === 0) {
        return Object.values(item || {}).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(searchValue)
        );
      }

      // Search only in the fields provided by the page
      return searchFields.some((field) => {
        const value = item?.[field];

        return String(value ?? "")
          .toLowerCase()
          .includes(searchValue);
      });
    });
  }, [data, searchTerm, searchFields]);

  return filteredData;
}

export default useSearchFilter;