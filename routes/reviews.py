"""Reviews CRUD."""
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.review import Review
from models.movie import Movie
from routes.auth import login_required, admin_required

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")


@reviews_bp.get("/movie/<int:movie_id>")
def get_reviews_for_movie(movie_id):
    reviews = Review.query.filter_by(movie_id=movie_id).order_by(Review.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews]), 200


@reviews_bp.post("")
@login_required
def create_review():
    data        = request.get_json(silent=True) or {}
    movie_id    = data.get("movie_id")
    review_text = (data.get("review_text") or "").strip()
    rating      = data.get("rating")
    user_id     = session["user_id"]

    if not all([movie_id, review_text, rating]):
        return jsonify({"error": "movie_id, review_text and rating are required"}), 400

    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return jsonify({"error": "rating must be an integer"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "rating must be between 1 and 5"}), 400

    if not Movie.query.get(movie_id):
        return jsonify({"error": "Movie not found"}), 404

    review = Review(user_id=user_id, movie_id=movie_id, review_text=review_text, rating=rating)
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201


@reviews_bp.put("/<int:review_id>")
@login_required
def update_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    if review.user_id != session["user_id"]:
        return jsonify({"error": "You can only edit your own reviews"}), 403

    data        = request.get_json(silent=True) or {}
    review_text = data.get("review_text")
    rating      = data.get("rating")

    if review_text is not None:
        review_text = review_text.strip()
        if not review_text:
            return jsonify({"error": "review_text cannot be empty"}), 400
        review.review_text = review_text

    if rating is not None:
        try:
            rating = int(rating)
        except (ValueError, TypeError):
            return jsonify({"error": "rating must be an integer"}), 400
        if rating < 1 or rating > 5:
            return jsonify({"error": "rating must be between 1 and 5"}), 400
        review.rating = rating

    db.session.commit()
    return jsonify(review.to_dict()), 200


@reviews_bp.delete("/<int:review_id>")
@login_required
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    if review.user_id != session["user_id"] and session.get("role") != "admin":
        return jsonify({"error": "Not authorized to delete this review"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"}), 200
