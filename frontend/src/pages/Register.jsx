import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]   = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = "At least 3 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setServerError(err.message);
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

          <h2 className="auth-title">Create an account</h2>
          <p className="auth-sub">Join and start discovering great movies</p>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                placeholder="Pick a username"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                autoFocus
              />
              {errors.username && <div className="field-error">{errors.username}</div>}
            </div>

            <div className="form-group">
              <label>Email <span style={{color:"var(--text-muted)"}}>(optional)</span></label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
              />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

