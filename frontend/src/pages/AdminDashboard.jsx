import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "../components/Loader.jsx";
import BackButton from "../components/BackButton.jsx";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.adminGetUsers(), api.adminGetStats()])
      .then(([u, s]) => { setUsers(u); setStats(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.adminChangeRole(userId, newRole);
      setSuccess(`Role updated to ${newRole}`);
      load();
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This will also delete all their reviews and ratings.`)) return;
    try {
      await api.adminDeleteUser(userId);
      setSuccess("User deleted");
      load();
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <main className="container" style={{ paddingTop: 20 }}>
      <BackButton to="/" label="Back to Home" />
      <div className="section" style={{ paddingTop: 0 }}>

        <div className="section-header">
          <div>
            <h2>👑 Admin Dashboard</h2>
            <p>Manage users and monitor app statistics</p>
          </div>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Stats cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total_users}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_movies}</div>
              <div className="stat-label">Total Movies</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_reviews}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
        )}

        {/* Users table */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>All Users ({users.length})</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.id === user.id ? "current-user-row" : ""}>
                    <td>#{u.id}</td>
                    <td>
                      <strong>{u.username}</strong>
                      {u.id === user.id && <span className="you-badge">You</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {u.id !== user.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          {u.role === "user" ? (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: 12, padding: "5px 10px" }}
                              onClick={() => handleRoleChange(u.id, "admin")}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: 12, padding: "5px 10px" }}
                              onClick={() => handleRoleChange(u.id, "user")}
                            >
                              Make User
                            </button>
                          )}
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: 12, padding: "5px 10px" }}
                            onClick={() => handleDelete(u.id, u.username)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
