import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-container">
      {/* Motion Cinema Background Elements */}
      <div className="cinema-bg-decor" aria-hidden="true">
        <div className="cinema-spotlight spotlight-1"></div>
        <div className="cinema-spotlight spotlight-2"></div>
        <div className="cinema-spotlight spotlight-3"></div>

        <div className="floating-badge badge-1">🎬</div>
        <div className="floating-badge badge-2">🍿</div>
        <div className="floating-badge badge-3">🎟️</div>
        <div className="floating-badge badge-4">🎥</div>
        <div className="floating-badge badge-5">⭐</div>

        <div className="film-strip strip-top">
          <div className="strip-track">
            <span>🎞️ NOW SHOWING</span>
            <span>✦</span>
            <span>🍿 POPCORN & REVIEWS</span>
            <span>✦</span>
            <span>🎬 CINEMATIC EXPERIENCES</span>
            <span>✦</span>
            <span>⭐ DISCOVER TOP MOVIES</span>
            <span>✦</span>
            <span>🎞️ NOW SHOWING</span>
            <span>✦</span>
            <span>🍿 POPCORN & REVIEWS</span>
            <span>✦</span>
            <span>🎬 CINEMATIC EXPERIENCES</span>
            <span>✦</span>
            <span>⭐ DISCOVER TOP MOVIES</span>
          </div>
        </div>

        <div className="film-strip strip-bottom">
          <div className="strip-track track-reverse">
            <span>🎥 EXCLUSIVE RATINGS</span>
            <span>✦</span>
            <span>🎟️ ADMIT ONE</span>
            <span>✦</span>
            <span>✨ LUXURY MOVIE-MATE</span>
            <span>✦</span>
            <span>🌟 HOLLYWOOD BLOCKBUSTERS</span>
            <span>✦</span>
            <span>🎥 EXCLUSIVE RATINGS</span>
            <span>✦</span>
            <span>🎟️ ADMIT ONE</span>
            <span>✦</span>
            <span>✨ LUXURY MOVIE-MATE</span>
            <span>✦</span>
            <span>🌟 HOLLYWOOD BLOCKBUSTERS</span>
          </div>
        </div>
      </div>

      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="logo-badge">🎬</span>
            <span>Movie-Mate</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to rate, review and discover movies</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

