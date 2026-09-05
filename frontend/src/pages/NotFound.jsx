import React from "react";
import { Link } from "react-router-dom";

export default function NotFound({ isNetworkError = false }) {
  return (
    <main className="cinema-auth-page" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="cinema-auth-overlay"></div>

      <div className="auth-wrap" style={{ minHeight: "auto", padding: "60px 20px" }}>
        <div className="cinema-auth-card" style={{ textAlign: "center", maxWidth: 480 }}>
          <div className="notfound-graphic">
            <div className="notfound-code">{isNetworkError ? "503" : "404"}</div>
            <div className="notfound-reel">🎬</div>
          </div>

          <h1 className="cinema-brand-title" style={{ fontSize: 26, margin: "16px 0 8px" }}>
            {isNetworkError ? "NETWORK CONNECTION LOST" : "PAGE NOT FOUND"}
          </h1>
          <div className="cinema-divider"></div>

          <p style={{ color: "rgba(250, 248, 245, 0.75)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 28 }}>
            {isNetworkError
              ? "Unable to connect to the Movie-Mate servers. Please check your internet connection and try again."
              : "The cinematic scene you are looking for does not exist or has been moved."
            }
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link to="/" className="btn btn-primary btn-block cinema-btn-primary">
              RETURN TO HOMEPAGE
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-block cinema-btn-secondary"
              onClick={() => window.location.reload()}
            >
              RELOAD PAGE
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
