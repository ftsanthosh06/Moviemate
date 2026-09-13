import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

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
    <main className="cinema-auth-page">
      <div className="cinema-auth-overlay"></div>

      <div className="auth-wrap">
        <div className="cinema-auth-card">
          <h1 className="cinema-brand-title">MOVIE-MATE</h1>
          <div className="cinema-divider"></div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20, textAlign: "center" }}>
              <div>{error}</div>
              {error.toLowerCase().includes("registered") && (
                <div style={{ marginTop: 8, fontSize: 13.5 }}>
                  Need an account?{" "}
                  <Link to="/register" style={{ color: "#FFFFFF", textDecoration: "underline", fontWeight: 700 }}>
                    Click here to Register
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="cinema-field-group">
              <label>USERNAME</label>
              <div className="cinema-input-wrap">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="cinema-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ margin: 0 }}>PASSWORD</label>
                <Link to="/forgot-password" style={{ fontSize: 12.5, color: "#FA2D48", fontWeight: 600, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="cinema-input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-block cinema-btn-primary" type="submit" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 10px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(250, 248, 245, 0.14)" }}></div>
            <span style={{ fontSize: 12, color: "rgba(250, 248, 245, 0.5)", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(250, 248, 245, 0.14)" }}></div>
          </div>

          <GoogleAuthButton onError={setError} />

          <div className="cinema-switch-wrap">
            <span style={{ fontSize: 13, color: "rgba(250, 248, 245, 0.7)" }}>Don't have an account?</span>
            <Link to="/register" className="btn btn-secondary btn-block cinema-btn-secondary" style={{ marginTop: 10 }}>
              SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
