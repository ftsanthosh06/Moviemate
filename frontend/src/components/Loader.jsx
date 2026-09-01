import React from "react";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = "🎬", title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <div>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}
