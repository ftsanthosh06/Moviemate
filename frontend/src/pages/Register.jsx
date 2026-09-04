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
    <main className="cinema-auth-page">
      <div className="cinema-auth-overlay"></div>

      <div className="auth-wrap">
        <div className="cinema-auth-card">
          <h1 className="cinema-brand-title">MOVIE-MATE</h1>
          <div className="cinema-divider"></div>
          <p className="cinema-brand-sub">CREATE YOUR ACCOUNT</p>

          {serverError && <div className="alert alert-error" style={{ marginBottom: 20 }}>{serverError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="cinema-field-group">
              <label>USERNAME *</label>
              <div className="cinema-input-wrap">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Pick a username"
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  autoFocus
                />
              </div>
              {errors.username && <div className="field-error">{errors.username}</div>}
            </div>

            <div className="cinema-field-group">
              <label>EMAIL (OPTIONAL)</label>
              <div className="cinema-input-wrap">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="cinema-field-group">
              <label>PASSWORD *</label>
              <div className="cinema-input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="cinema-field-group">
              <label>CONFIRM PASSWORD *</label>
              <div className="cinema-input-wrap">
                <span className="input-icon">🔑</span>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                />
              </div>
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>

            <button className="btn btn-primary btn-block cinema-btn-primary" type="submit" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="cinema-switch-wrap">
            <span style={{ fontSize: 13, color: "rgba(250, 248, 245, 0.7)" }}>Already have an account?</span>
            <Link to="/login" className="btn btn-secondary btn-block cinema-btn-secondary" style={{ marginTop: 10 }}>
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
