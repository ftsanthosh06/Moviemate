import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";
import StarRating from "../components/StarRating.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import MovieCard from "../components/MovieCard.jsx";
import { Loader, EmptyState } from "../components/Loader.jsx";


export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isLoggedIn } = useAuth();

  const [movie, setMovie]     = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [myRating, setMyRating] = useState(0);
  const [imgError, setImgError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getMovie(id), api.getReviews(id), api.getRelatedMovies(id)])
      .then(([m, r, rel]) => { setMovie(m); setReviews(r); setRelated(rel); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const handleRate = (value) => {
    if (!isLoggedIn) { setError("Please log in to rate movies."); return; }
    setMyRating(value);
    api.rateMovie({ movie_id: Number(id), rating: value })
      .then(() => { setSuccess("Rating saved!"); load(); setTimeout(() => setSuccess(""), 2000); })
      .catch((e) => setError(e.message));
  };

  const handleDeleteMovie = () => {
    if (!window.confirm(`Delete "${movie.title}"?`)) return;
    api.deleteMovie(id).then(() => navigate("/")).catch((e) => setError(e.message));
  };

  const handleEditReview  = (reviewId, payload) =>
    api.updateReview(reviewId, payload).then(load).catch((e) => setError(e.message));

  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    api.deleteReview(reviewId).then(load).catch((e) => setError(e.message));
  };

  if (loading) return <Loader label="Loading movie..." />;
  if (!movie)  return <div className="container"><div className="alert alert-error">{error || "Movie not found"}</div></div>;

  return (
    <main className="container" style={{ paddingTop: 20 }}>
      <BackButton to="/" label="Back to Movies" />
      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="details-hero">
        <div className="details-poster">
          {movie.poster_url && !imgError ? (
            <img src={movie.poster_url} alt={movie.title} onError={() => setImgError(true)} />
          ) : (
            <div className="poster-placeholder" style={{ height: "100%" }}>🎬</div>
          )}
        </div>


        <div>
          <h1 className="details-title">{movie.title}</h1>
          <div className="details-tags">
            <span className="genre-tag">{movie.genre}</span>
            <span className="genre-tag">{movie.release_year}</span>
          </div>

          <div className="details-rating-row">
            <span className="details-rating-number">{movie.average_rating || "—"}</span>
            <div>
              <StarRating value={movie.average_rating} />
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                {movie.rating_count} rating{movie.rating_count === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <p className="details-description">{movie.description || "No description available."}</p>
          <div className="details-facts">
            <div><b>Director:</b> {movie.director || "Unknown"}</div>
            <div><b>Cast:</b> {movie.cast || "Unknown"}</div>
          </div>

          {isLoggedIn && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Your rating:</div>
              <StarRating value={myRating} interactive size={26} onRate={handleRate} />
            </div>
          )}

          <div className="details-actions">
            {isLoggedIn && (
              <Link to={`/movies/${id}/review`} className="btn btn-primary">Write a Review</Link>
            )}
            {isAdmin && (
              <>
                <Link to={`/movies/${id}/edit`} className="btn btn-secondary">Edit Movie</Link>
                <button className="btn btn-danger" onClick={handleDeleteMovie}>Delete Movie</button>
              </>
            )}
            {!isLoggedIn && (
              <Link to="/login" className="btn btn-secondary">Sign in to rate & review</Link>
            )}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Reviews ({reviews.length})</h2>
        </div>
        {reviews.length === 0
          ? <EmptyState icon="📝" title="No reviews yet" subtitle="Be the first to share your thoughts." />
          : reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))
        }
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-header"><h2>You Might Also Like</h2></div>
          <div className="movie-grid">
            {related.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}
    </main>
  );
}
