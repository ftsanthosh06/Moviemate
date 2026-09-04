"""
Movie-Mate Flask application entry point.
Run with: python app.py
"""
import sys
import os

# Add backend directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, bcrypt
from models import User, Movie, Rating, Review


def seed_demo_data():
    """Seed initial movies and users if database is empty."""
    if User.query.count() == 0:
        demo_users = [
            {"username": "admin",    "email": "admin@moviemate.com",    "password": "admin123",  "role": "admin"},
            {"username": "santhosh", "email": "santhosh@moviemate.com", "password": "user123",   "role": "user"},
            {"username": "ananya",   "email": "ananya@moviemate.com",   "password": "user123",   "role": "user"},
            {"username": "rahul",    "email": "rahul@moviemate.com",    "password": "user123",   "role": "user"},
        ]
        for data in demo_users:
            u = User(username=data["username"], email=data["email"], role=data["role"])
            u.set_password(data["password"])
            db.session.add(u)

    if Movie.query.count() == 0:
        demo_movies = [
            Movie(title="The Dark Knight", description="When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability.", genre="Action", release_year=2008, director="Christopher Nolan", cast_list="Christian Bale, Heath Ledger, Aaron Eckhart", poster_url="https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"),
            Movie(title="Parasite", description="Greed and class discrimination threaten the relationship between the wealthy Park family and the destitute Kim clan.", genre="Drama", release_year=2019, director="Bong Joon-ho", cast_list="Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong", poster_url="https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"),
            Movie(title="Interstellar", description="A team of explorers travel through a wormhole in space to ensure humanity survival.", genre="Sci-Fi", release_year=2014, director="Christopher Nolan", cast_list="Matthew McConaughey, Anne Hathaway, Jessica Chastain", poster_url="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"),
            Movie(title="The Grand Budapest Hotel", description="The adventures of Gustave H, a legendary concierge, and Zero Moustafa, the lobby boy who becomes his trusted friend.", genre="Comedy", release_year=2014, director="Wes Anderson", cast_list="Ralph Fiennes, Tony Revolori, Saoirse Ronan", poster_url="https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg"),
            Movie(title="Whiplash", description="A promising young drummer enrolls at a cutthroat music conservatory where his instructor will stop at nothing.", genre="Drama", release_year=2014, director="Damien Chazelle", cast_list="Miles Teller, J.K. Simmons, Melissa Benoist", poster_url="https://image.tmdb.org/t/p/w500/oPxnRhyAIzJKGUEuq3cxL9Mfo1z.jpg"),
        ]

        for m in demo_movies:
            db.session.add(m)

    db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow credentials from React dev server (supports port 5173, 5174, 3000, 127.0.0.1)
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
             "https://moviemate-self.vercel.app",
        ],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )
    
    # Session configuration for production
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        try:
            db.create_all()
            seed_demo_data()
        except Exception as e:
            print(f"Error during DB initialization: {e}")


    # Register blueprints
    from routes.auth import auth_bp
    from routes.movies import movies_bp
    from routes.ratings import ratings_bp
    from routes.reviews import reviews_bp
    from routes.recommendations import recommendations_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(ratings_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(admin_bp)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok", "service": "Movie-Mate API"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(500)
    def server_error(e):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

