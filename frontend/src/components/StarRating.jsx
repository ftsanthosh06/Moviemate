import React, { useState } from "react";

/**
 * Displays a 1-5 star rating.
 * If `interactive` is true, clicking a star calls onRate(value).
 */
export default function StarRating({ value = 0, size = 18, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= display ? "filled" : ""} ${interactive ? "interactive" : ""}`}
          style={{ fontSize: size }}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
