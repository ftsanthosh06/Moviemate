import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">🎬</span>
          Movie-Mate
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          type="button"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          {isLoggedIn && (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                Home
              </NavLink>

              {isAdmin && (
                <>
                  <NavLink
                    to="/add-movie"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={closeMenu}
                  >
                    Add Movie
                  </NavLink>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={closeMenu}
                  >
                    👑 Admin
                  </NavLink>
                </>
              )}

              <div className="user-badge">
                <span>{isAdmin ? "👑" : "👤"}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {user?.username}
                </span>
                <span className={`role-pill ${user?.role}`}>{user?.role}</span>
              </div>

              <button
                className="btn btn-secondary nav-signout-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: "7px 14px" }}
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ fontSize: 13, padding: "7px 14px" }}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

