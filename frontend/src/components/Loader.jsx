import React from "react";

export function Loader({ label = "Loading Cinema..." }) {
  return (
    <div className="cinema-loader-wrap">
      <div className="cinema-reel-spinner">
        <div className="reel-ring"></div>
        <div className="reel-center">🎬</div>
      </div>
      <div className="loader-label">{label}</div>
    </div>
  );
}

export function EmptyState({ icon = "🎬", title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-sub">{subtitle}</div>}
    </div>
  );
}
