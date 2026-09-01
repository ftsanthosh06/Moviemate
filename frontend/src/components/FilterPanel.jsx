import React from "react";

const SORT_OPTIONS = [
  { value: "", label: "Sort by" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "lowest_rated", label: "Lowest Rated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most_reviewed", label: "Most Reviewed" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

export default function FilterPanel({ genres, filters, onChange }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-panel">
      <select value={filters.genre} onChange={(e) => update("genre", e.target.value)}>
        <option value="">All Genres</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select value={filters.year} onChange={(e) => update("year", e.target.value)}>
        <option value="">All Years</option>
        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select value={filters.min_rating} onChange={(e) => update("min_rating", e.target.value)}>
        {RATING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
