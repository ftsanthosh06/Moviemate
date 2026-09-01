"""Admin blueprint — user management."""
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.user import User
from models.movie import Movie
from models.review import Review
from routes.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/users")
@admin_required
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.put("/users/<int:user_id>/role")
@admin_required
def change_role(user_id):
    if user_id == session["user_id"]:
        return jsonify({"error": "Cannot change your own role"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("user", "admin"):
        return jsonify({"error": "Role must be 'user' or 'admin'"}), 400

    user.role = role
    db.session.commit()
    return jsonify({"message": f"Role updated to {role}", "user": user.to_dict()}), 200


@admin_bp.delete("/users/<int:user_id>")
@admin_required
def delete_user(user_id):
    if user_id == session["user_id"]:
        return jsonify({"error": "Cannot delete your own account"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.get("/stats")
@admin_required
def stats():
    return jsonify({
        "total_users":   User.query.count(),
        "total_movies":  Movie.query.count(),
        "total_reviews": Review.query.count(),
    }), 200
