import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)} role="button" tabIndex={0}>
      <div className="movie-poster">
        {movie.poster_url && !imgError ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="poster-placeholder">🎬</div>
        )}
        <div className="rating-pill">
          <span>★</span> {movie.average_rating > 0 ? movie.average_rating.toFixed(1) : "New"}
        </div>
      </div>

      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>
        <div className="movie-meta">
          <span className="genre-tag">{movie.genre}</span>
          <span>{movie.release_year}</span>
        </div>
        <div className="movie-meta">{movie.rating_count} rating{movie.rating_count === 1 ? "" : "s"}</div>
      </div>
    </div>
  );
}
