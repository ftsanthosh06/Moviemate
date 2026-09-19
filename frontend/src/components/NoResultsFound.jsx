import React from "react";

export default function NoResultsFound({ searchTerm, activeFilters, onReset }) {
  const hasActiveFilters = Boolean(
    searchTerm ||
    activeFilters?.genre ||
    activeFilters?.year ||
    activeFilters?.min_rating ||
    activeFilters?.sort
  );

  return (
    <div className="no-results-card" style={{
      background: "rgba(18, 26, 19, 0.88)",
      border: "1px solid rgba(250, 248, 245, 0.16)",
      borderRadius: "var(--radius-lg)",
      padding: "48px 24px",
      textAlign: "center",
      maxWidth: 620,
      margin: "32px auto",
      backdropFilter: "blur(20px)",
      boxShadow: "var(--shadow-card)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Ambient Glow */}
      <div style={{
        position: "absolute",
        top: "-40px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "240px",
        height: "240px",
        background: "radial-gradient(circle, rgba(250, 45, 72, 0.2) 0%, rgba(0,0,0,0) 70%)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Animated Cinema Graphic Icon */}
        <div style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: "rgba(250, 248, 245, 0.05)",
          border: "1px solid rgba(250, 248, 245, 0.15)",
          fontSize: 38,
          marginBottom: 16,
          boxShadow: "0 0 24px rgba(250, 45, 72, 0.2)"
        }}>
          🎬
          <span style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            fontSize: 20,
            background: "var(--red-gradient)",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
          }}>
            🔍
          </span>
        </div>

        {/* Status Pill Badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 999,
            background: "rgba(250, 45, 72, 0.14)",
            border: "1px solid rgba(250, 45, 72, 0.35)",
            color: "#FA2D48",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#FA2D48",
              boxShadow: "0 0 8px #FA2D48"
            }}></span>
            No Movies Match Criteria
          </span>
        </div>

        <h3 style={{
          fontFamily: "var(--font-heading)",
          fontSize: 24,
          fontWeight: 800,
          color: "#FAF8F5",
          margin: "0 0 10px",
          letterSpacing: "-0.02em"
        }}>
          NO CINEMATIC MATCHES FOUND
        </h3>

        <p style={{
          color: "rgba(250, 248, 245, 0.72)",
          fontSize: 14.5,
          lineHeight: 1.6,
          maxWidth: 460,
          margin: "0 auto 24px"
        }}>
          {searchTerm ? (
            <>No movies found matching <b style={{ color: "#FFF" }}>"{searchTerm}"</b>.</>
          ) : (
            "We couldn't find any movies matching your selected genre, year, or rating filters."
          )}
        </p>

        {/* Action Controls */}
        {hasActiveFilters && onReset && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onReset}
              style={{ padding: "10px 22px", fontSize: 13.5, fontWeight: 700 }}
            >
              🔄 RESET SEARCH & FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
