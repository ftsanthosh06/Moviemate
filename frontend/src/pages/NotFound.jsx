import React from "react";
import { Link } from "react-router-dom";

export default function NotFound({ isNetworkError = false, onRetry }) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <main className="cinema-auth-page" style={{ alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div className="cinema-auth-overlay"></div>

      <div className="auth-wrap" style={{ minHeight: "auto", padding: "40px 20px" }}>
        <div className="cinema-auth-card" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          
          {/* Animated Graphic Header */}
          <div className="notfound-graphic" style={{ marginBottom: 12 }}>
            <div className="notfound-code">{isNetworkError ? "503" : "404"}</div>
            <div className="loader-ring-wrap" style={{ position: "absolute", width: 100, height: 100 }}>
              <div className="reel-ring"></div>
            </div>
            <div className="notfound-reel" style={{ position: "relative", zIndex: 2 }}>
              {isNetworkError ? "📡" : "🎬"}
            </div>
          </div>

          {/* Status Alert Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: isNetworkError ? "rgba(250, 45, 72, 0.15)" : "rgba(255, 215, 0, 0.15)",
            border: isNetworkError ? "1px solid rgba(250, 45, 72, 0.4)" : "1px solid rgba(255, 215, 0, 0.4)",
            color: isNetworkError ? "#FA2D48" : "#FFD700",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 16
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "currentColor",
              boxShadow: "0 0 10px currentColor",
              animation: "reelPulse 1.2s ease-in-out infinite alternate"
            }}></span>
            {isNetworkError ? "Network / Server Offline" : "Scene Not Found"}
          </div>

          <h1 className="cinema-brand-title" style={{ fontSize: 26, margin: "0 0 10px" }}>
            {isNetworkError ? "NETWORK CONNECTION LOST" : "PAGE NOT FOUND"}
          </h1>
          <div className="cinema-divider"></div>

          <p style={{ color: "rgba(250, 248, 245, 0.8)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 28 }}>
            {isNetworkError
              ? "Unable to connect to the Movie-Mate backend servers. Please check your Wi-Fi or network connection and try again."
              : "The cinematic scene you are looking for does not exist or has been moved."
            }
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              type="button"
              className="btn btn-primary btn-block cinema-btn-primary"
              onClick={handleRetry}
            >
              🔄 RETRY CONNECTION
            </button>
            
            <Link to="/" className="btn btn-secondary btn-block cinema-btn-secondary">
              🏠 RETURN TO HOMEPAGE
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
