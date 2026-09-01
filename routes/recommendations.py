"""Recommendations engine."""
from flask import Blueprint, request, jsonify, session
from models.movie import Movie
from models.rating import Rating
from routes.auth import login_required

recommendations_bp = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")


@recommendations_bp.get("/me")
@login_required
def get_my_recommendations():
    user_id = session["user_id"]
    limit   = request.args.get("limit", default=8, type=int)

    user_ratings    = Rating.query.filter_by(user_id=user_id).all()
    rated_movie_ids = {r.movie_id for r in user_ratings}

    preferred_genres = set()
    for r in user_ratings:
        if r.rating >= 4 and r.movie:
            preferred_genres.add(r.movie.genre)

    candidates = Movie.query.filter(~Movie.id.in_(rated_movie_ids)).all() \
        if rated_movie_ids else Movie.query.all()

    def score(movie):
        s = movie.average_rating()
        if movie.genre in preferred_genres:
            s += 1.5
        if movie.average_rating() >= 4:
            s += 0.5
        return s

    ranked = sorted(candidates, key=score, reverse=True)
    return jsonify({
        "preferred_genres":  sorted(preferred_genres),
        "recommendations":   [m.to_dict() for m in ranked[:limit]],
    }), 200


@recommendations_bp.get("/related/<int:movie_id>")
def get_related_movies(movie_id):
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    related = Movie.query.filter(Movie.genre == movie.genre, Movie.id != movie.id).all()
    related.sort(key=lambda m: m.average_rating(), reverse=True)
    return jsonify([m.to_dict() for m in related[:6]]), 200
