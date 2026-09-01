import React, { useEffect, useState } from "react";
import { api } from "../api/api.js";
import MovieCard from "./MovieCard.jsx";
import { Loader, EmptyState } from "./Loader.jsx";

export default function RecommendationSection() {
  const [recs, setRecs]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecommendations(8)
      .then(setRecs)
      .catch(() => setRecs({ recommendations: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Building your recommendations..." />;
  if (!recs || recs.recommendations.length === 0)
    return <EmptyState icon="✨" title="No recommendations yet" subtitle="Rate a few movies to get personalized picks." />;

  return (
    <div>
      {recs.preferred_genres?.length > 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
          Based on your love for {recs.preferred_genres.join(", ")}
        </p>
      )}
      <div className="movie-grid">
        {recs.recommendations.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
}
