import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import AddMovie from "./pages/AddMovie.jsx";
import WriteReview from "./pages/WriteReview.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <Navbar />
      {!isOnline ? (
        <NotFound isNetworkError={true} onRetry={() => setIsOnline(navigator.onLine)} />
      ) : (
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movies/:id" element={<MovieDetails />} />

          {/* Protected: logged-in users */}
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/movies/:id/review" element={
            <ProtectedRoute><WriteReview /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/add-movie" element={
            <ProtectedRoute adminOnly><AddMovie /></ProtectedRoute>
          } />
          <Route path="/movies/:id/edit" element={
            <ProtectedRoute adminOnly><AddMovie /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      <footer className="footer">MOVIE-MATE &copy; 2026 &mdash; Designed for Cinema Lovers</footer>
    </AuthProvider>
  );
}

