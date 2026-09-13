import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = enter OTP & reset password
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [emailMasked, setEmailMasked] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    if (!identifier.trim()) {
      setError("Please enter your username or registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.requestOtp(identifier.trim());
      setEmailMasked(res.email_masked || "");
      if (res.demo_otp) setDemoOtp(res.demo_otp);
      setInfoMsg(res.message || "OTP verification code sent to your registered email!");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    if (!otp.trim() || !newPassword.trim()) {
      setError("Please enter both the OTP verification code and your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPasswordWithOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        new_password: newPassword.trim(),
      });
      alert(res.message || "Password reset successfully! Please sign in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cinema-auth-page" style={{ alignItems: "center", justifyContent: "center", minHeight: "85vh" }}>
      <div className="cinema-auth-overlay"></div>

      <div className="auth-wrap">
        <div className="cinema-auth-card" style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 className="cinema-brand-title">MOVIE-MATE</h1>
          <div className="cinema-divider"></div>

          <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6, color: "var(--text-primary)" }}>
            🔑 Reset Account Password
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", textAlign: "center", marginBottom: 24 }}>
            {step === 1
              ? "Enter your registered username, email address, or mobile number to receive a 6-digit OTP verification code."
              : `Enter the 6-digit verification code sent to ${emailMasked || "your registered email/mobile"} and set your new password.`}
          </p>

          {error && <div className="alert alert-error" style={{ marginBottom: 20, textAlign: "center" }}>{error}</div>}
          {infoMsg && <div className="alert alert-success" style={{ marginBottom: 20, textAlign: "center" }}>{infoMsg}</div>}

          {demoOtp && step === 2 && (
            <div style={{
              background: "rgba(255, 215, 0, 0.12)",
              border: "1px solid rgba(255, 215, 0, 0.35)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13.5,
              color: "#FFD700",
              textAlign: "center"
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>📩 OTP Email / SMS Verification Code:</div>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#FFFFFF", display: "inline-block", margin: "4px 0" }}>
                {demoOtp}
              </span>
              <div style={{ fontSize: 12, color: "rgba(250, 248, 245, 0.7)" }}>
                Valid for 10 minutes. Enter this 6-digit code below to reset your password.
              </div>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <div className="cinema-field-group">
                <label>USERNAME, EMAIL, OR MOBILE NUMBER</label>
                <div className="cinema-input-wrap">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Enter username, email, or mobile (+91...)"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-block cinema-btn-primary" type="submit" disabled={loading}>
                {loading ? "SENDING OTP..." : "SEND OTP VERIFICATION CODE"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="cinema-field-group">
                <label>6-DIGIT OTP VERIFICATION CODE</label>
                <div className="cinema-input-wrap">
                  <span className="input-icon">🔐</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP (e.g. 849201)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                    style={{ letterSpacing: 3, fontWeight: 700, fontSize: 16 }}
                  />
                </div>
              </div>

              <div className="cinema-field-group">
                <label>NEW PASSWORD</label>
                <div className="cinema-input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Enter your new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-block cinema-btn-primary" type="submit" disabled={loading}>
                {loading ? "VERIFYING..." : "VERIFY OTP & RESET PASSWORD"}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block cinema-btn-secondary"
                style={{ marginTop: 10 }}
                onClick={() => setStep(1)}
              >
                ← Request New OTP Code
              </button>
            </form>
          )}

          <div className="cinema-switch-wrap" style={{ marginTop: 24 }}>
            <span style={{ fontSize: 13, color: "rgba(250, 248, 245, 0.7)" }}>Remembered your password?</span>
            <Link to="/login" className="btn btn-secondary btn-block cinema-btn-secondary" style={{ marginTop: 10 }}>
              RETURN TO SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
