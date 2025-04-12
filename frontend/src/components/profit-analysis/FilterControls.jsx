"use client"

import "../../styles/profit-analysis/FilterControls.css"

const FilterControls = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="filter-controls">
      <button
        className={`filter-btn ${currentFilter === "week" ? "active" : ""}`}
        onClick={() => onFilterChange("week")}
      >
        This Week
      </button>

      <button
        className={`filter-btn ${currentFilter === "month" ? "active" : ""}`}
        onClick={() => onFilterChange("month")}
      >
        This Month
      </button>

      <button
        className={`filter-btn ${currentFilter === "quarter" ? "active" : ""}`}
        onClick={() => onFilterChange("quarter")}
      >
        Last 3 Months
      </button>
    </div>
  )
}

export default FilterControls
