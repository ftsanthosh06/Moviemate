import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StarRating from "../components/StarRating.jsx";
import BackButton from "../components/BackButton.jsx";

export default function WriteReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie]       = useState(null);
  const [rating, setRating]     = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getMovie(id).then(setMovie).catch((e) => setError(e.message));
  }, [id]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setError("");
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!reviewText.trim()) { setError("Please write a review."); return; }

    setSubmitting(true);
    try {
      await api.createReview({ movie_id: Number(id), review_text: reviewText.trim(), rating });
      await api.rateMovie({ movie_id: Number(id), rating });
      navigate(`/movies/${id}`, {
        state: { successMsg: `Review posted successfully by ${user?.username || "you"}!` }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <main className="container" style={{ paddingTop: 20 }}>
      <BackButton to={`/movies/${id}`} label="Back to Movie" />
      <div className="section" style={{ paddingTop: 0 }}>

        <div className="section-header">
          <div>
            <h2>Write a Review</h2>
            {movie && <p>for <strong>{movie.title}</strong> ({movie.release_year})</p>}
          </div>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Your Rating *</label>
            <StarRating value={rating} interactive size={28} onRate={setRating} />
          </div>
          <div className="form-group">
            <label>Your Review *</label>
            <textarea rows={6} value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of this movie?" />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <Link to={`/movies/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
