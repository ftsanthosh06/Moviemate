"""Ratings CRUD."""
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.rating import Rating
from models.movie import Movie
from routes.auth import login_required

ratings_bp = Blueprint("ratings", __name__, url_prefix="/api/ratings")


@ratings_bp.post("")
@login_required
def create_or_update_rating():
    data         = request.get_json(silent=True) or {}
    movie_id     = data.get("movie_id")
    rating_value = data.get("rating")
    user_id      = session["user_id"]

    if not all([movie_id, rating_value]):
        return jsonify({"error": "movie_id and rating are required"}), 400

    try:
        rating_value = int(rating_value)
    except (ValueError, TypeError):
        return jsonify({"error": "rating must be an integer"}), 400

    if rating_value < 1 or rating_value > 5:
        return jsonify({"error": "rating must be between 1 and 5"}), 400

    if not Movie.query.get(movie_id):
        return jsonify({"error": "Movie not found"}), 404

    existing = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if existing:
        existing.rating = rating_value
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    rating = Rating(user_id=user_id, movie_id=movie_id, rating=rating_value)
    db.session.add(rating)
    db.session.commit()
    return jsonify(rating.to_dict()), 201


@ratings_bp.get("/movie/<int:movie_id>")
def get_ratings_for_movie(movie_id):
    ratings = Rating.query.filter_by(movie_id=movie_id).all()
    return jsonify([r.to_dict() for r in ratings]), 200


@ratings_bp.delete("/<int:rating_id>")
@login_required
def delete_rating(rating_id):
    rating = Rating.query.get(rating_id)
    if not rating:
        return jsonify({"error": "Rating not found"}), 404
    if rating.user_id != session["user_id"] and session.get("role") != "admin":
        return jsonify({"error": "Not authorized"}), 403
    db.session.delete(rating)
    db.session.commit()
    return jsonify({"message": "Rating deleted"}), 200
