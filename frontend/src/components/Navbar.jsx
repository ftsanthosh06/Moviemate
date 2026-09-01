import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🎬</span>
          Movie-Mate
        </Link>

        <nav className="nav-links">
          {isLoggedIn && (
            <>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Home
              </NavLink>

              {isAdmin && (
                <>
                  <NavLink to="/add-movie" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    Add Movie
                  </NavLink>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
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

              <button className="btn btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }} onClick={handleLogout}>
                Sign Out
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 13, padding: "7px 14px" }}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
