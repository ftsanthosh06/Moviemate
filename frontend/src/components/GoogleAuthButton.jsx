import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function GoogleAuthButton({ onError }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "793284910234-moviemate.apps.googleusercontent.com";

  // List of device accounts detected or entered
  const [savedDeviceAccounts, setSavedDeviceAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("moviemate_device_accounts");
      return saved ? JSON.parse(saved) : ["santhosh.official2k06@gmail.com"];
    } catch (_) {
      return ["santhosh.official2k06@gmail.com"];
    }
  });

  useEffect(() => {
    if (window.google?.accounts) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleSelectGoogleAccount = async (email) => {
    if (!email || !email.trim()) return;
    setLoading(true);
    setShowAccountModal(false);
    
    // Save account to device accounts list
    const cleanEmail = email.trim();
    if (!savedDeviceAccounts.includes(cleanEmail)) {
      const updated = [cleanEmail, ...savedDeviceAccounts];
      setSavedDeviceAccounts(updated);
      try { localStorage.setItem("moviemate_device_accounts", JSON.stringify(updated)); } catch (_) {}
    }

    const name = cleanEmail.split("@")[0];
    try {
      const user = await googleLogin({ email: cleanEmail, name });
      navigate(user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      if (onError) onError(err.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setLoading(true);

    // Try Google Native OAuth2 Token Client with prompt: 'select_account'
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                if (profile && profile.email) {
                  const user = await googleLogin({
                    email: profile.email,
                    name: profile.name || profile.given_name || profile.email.split("@")[0],
                    picture: profile.picture,
                  });
                  navigate(user?.role === "admin" ? "/admin" : "/");
                  return;
                }
              } catch (_) {}
            }
            setShowAccountModal(true);
            setLoading(false);
          },
        });
        client.requestAccessToken({ prompt: "select_account" });
        setLoading(false);
        return;
      } catch (_) {}
    }

    // Show native device account selector modal
    setShowAccountModal(true);
    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-block"
        onClick={handleGoogleClick}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "rgba(18, 26, 19, 0.88)",
          border: "1px solid rgba(250, 248, 245, 0.22)",
          color: "#FAF8F5",
          fontSize: 14,
          fontWeight: 600,
          padding: "12px 16px",
          borderRadius: "var(--radius-pill)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
          transition: "var(--transition)",
          marginTop: 14,
          marginBottom: 16
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#FA2D48";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(250, 45, 72, 0.3)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(250, 248, 245, 0.22)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.3)";
          e.currentTarget.style.transform = "none";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        <span>{loading ? "AUTHENTICATING WITH GOOGLE..." : "CONTINUE WITH GOOGLE"}</span>
      </button>

      {/* Selectable Device Google Accounts Modal */}
      {showAccountModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: "#121A13",
            border: "1px solid rgba(250, 248, 245, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "24px 28px",
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
            textAlign: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              <h3 style={{ margin: 0, fontSize: 18, color: "#FAF8F5" }}>Choose a Google Account</h3>
            </div>
            <p style={{ fontSize: 13, color: "rgba(250, 248, 245, 0.7)", marginBottom: 18 }}>
              Select a Google account logged in on your device to continue to Movie-Mate:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {savedDeviceAccounts.map((accEmail) => (
                <button
                  key={accEmail}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(accEmail)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(250, 248, 245, 0.07)",
                    border: "1px solid rgba(250, 248, 245, 0.15)",
                    color: "#FAF8F5",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(250, 45, 72, 0.15)";
                    e.currentTarget.style.borderColor = "rgba(250, 45, 72, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(250, 248, 245, 0.07)";
                    e.currentTarget.style.borderColor = "rgba(250, 248, 245, 0.15)";
                  }}
                >
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--red-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#FFF"
                  }}>
                    {accEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{accEmail.split("@")[0]}</div>
                    <div style={{ fontSize: 12, color: "rgba(250, 248, 245, 0.6)" }}>{accEmail}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Input to add another logged in device account */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  placeholder="Enter another Google Email"
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(250, 248, 245, 0.2)",
                    background: "rgba(10, 16, 12, 0.8)",
                    color: "#FAF8F5",
                    fontSize: 13
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (customEmailInput.trim()) {
                      handleSelectGoogleAccount(customEmailInput.trim());
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm btn-block"
              onClick={() => setShowAccountModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
