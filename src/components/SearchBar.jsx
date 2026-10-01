import React from "react";
import "../Styles/SearchBar.css";

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  maxLength = 25,
}) {
  return (
    <div className="search-bar">
      <span className="search-bar-icon">⌕</span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={maxLength}
      />

      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;