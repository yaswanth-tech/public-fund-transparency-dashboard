import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  onReset
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search className="filter-search-icon" />
        <input
          type="text"
          placeholder="Search by keyword, ward, project, or representative..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-options">
        {filters.map((filter) => (
          <div key={filter.key} className="filter-group">
            <select
              value={selectedFilters[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="filter-select"
            >
              <option value="">{filter.label}: All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onReset && (
          <button onClick={onReset} className="btn btn-ghost btn-sm" title="Reset Filters">
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
