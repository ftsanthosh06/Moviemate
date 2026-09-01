import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import SearchBar from "../components/SearchBar.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import MovieCard from "../components/MovieCard.jsx";
import RecommendationSection from "../components/RecommendationSection.jsx";
import { Loader, EmptyState } from "../components/Loader.jsx";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [movies, setMovies]   = useState([]);
  const [genres, setGenres]   = useState([]);
  const [search, setSearch]   = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", min_rating: "", sort: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const loadMovies = useCallback(() => {
    setLoading(true);
    setError("");
    api.getMovies({ q: search, ...filters })
      .then(setMovies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, filters]);

  useEffect(() => { api.getGenres().then(setGenres).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(loadMovies, 300); return () => clearTimeout(t); }, [loadMovies]);

  const topRated   = [...movies].sort((a, b) => b.average_rating - a.average_rating).slice(0, 6);
  const isFiltering = search || filters.genre || filters.year || filters.min_rating || filters.sort;

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Cinema. <span>Elevated.</span></h1>
          <p>Discover, rate, and curate your personal collection of extraordinary movies.</p>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <SearchBar value={search} onChange={setSearch} />
            <FilterPanel genres={genres} filters={filters} onChange={setFilters} />
          </div>
        </div>
      </section>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {isFiltering ? (
          <section className="section">
            <div className="section-header">
              <div>
                <h2>Results</h2>
                <p>{movies.length} movie{movies.length === 1 ? "" : "s"} found</p>
              </div>
            </div>
            {loading ? <Loader label="Loading movies..." /> :
              movies.length === 0 ? <EmptyState title="No movies match your search" /> :
              <div className="movie-grid">{movies.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
            }
          </section>
        ) : (
          <>
            {isLoggedIn && (
              <section className="section">
                <div className="section-header">
                  <div>
                    <h2>✨ Recommended for You</h2>
                    <p>Personalized picks based on your ratings</p>
                  </div>
                </div>
                <RecommendationSection />
              </section>
            )}

            <section className="section">
              <div className="section-header">
                <div>
                  <h2>⭐ Top Rated</h2>
                  <p>Highest rated movies on Movie-Mate</p>
                </div>
              </div>
              {loading ? <Loader label="Loading movies..." /> :
                <div className="movie-grid">{topRated.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
              }
            </section>

            <section className="section">
              <div className="section-header">
                <div>
                  <h2>🎬 All Movies</h2>
                  <p>Browse the full catalog</p>
                </div>
              </div>
              {loading ? <Loader label="Loading movies..." /> :
                movies.length === 0 ? <EmptyState title="No movies yet" subtitle="An admin can add movies." /> :
                <div className="movie-grid">{movies.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
              }
            </section>
          </>
        )}
      </div>
    </main>
  );
}
