import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "./Loader.jsx";

/**
 * Wraps a route: redirects to /login if not authenticated.
 * If adminOnly=true, also redirects non-admins to /.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
