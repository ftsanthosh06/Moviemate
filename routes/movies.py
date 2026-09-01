"""Movies CRUD and search/filter/sort."""
from flask import Blueprint, request, jsonify
from extensions import db
from models.movie import Movie
from models.rating import Rating
from models.review import Review
from routes.auth import admin_required

movies_bp = Blueprint("movies", __name__, url_prefix="/api/movies")

REQUIRED_FIELDS = ["title", "genre", "release_year"]


def _validate_movie_payload(data):
    errors = []
    for field in REQUIRED_FIELDS:
        if not str(data.get(field, "")).strip():
            errors.append(f"'{field}' is required")
    year = data.get("release_year")
    if year is not None:
        try:
            int(year)
        except (ValueError, TypeError):
            errors.append("'release_year' must be a number")
    return errors


@movies_bp.get("")
def get_movies():
    query = Movie.query

    q = request.args.get("q", "").strip()
    if q:
        query = query.filter(Movie.title.ilike(f"%{q}%"))

    genre = request.args.get("genre", "").strip()
    if genre and genre.lower() != "all":
        query = query.filter(Movie.genre.ilike(genre))

    year = request.args.get("year", "").strip()
    if year:
        try:
            query = query.filter(Movie.release_year == int(year))
        except ValueError:
            pass

    movies = query.all()

    min_rating = request.args.get("min_rating", "").strip()
    if min_rating:
        try:
            min_r = float(min_rating)
            movies = [m for m in movies if m.average_rating() >= min_r]
        except ValueError:
            pass

    sort = request.args.get("sort", "").strip()
    if sort == "highest_rated":
        movies.sort(key=lambda m: m.average_rating(), reverse=True)
    elif sort == "lowest_rated":
        movies.sort(key=lambda m: m.average_rating())
    elif sort == "newest":
        movies.sort(key=lambda m: m.release_year, reverse=True)
    elif sort == "oldest":
        movies.sort(key=lambda m: m.release_year)
    elif sort == "most_reviewed":
        movies.sort(key=lambda m: len(m.reviews), reverse=True)

    return jsonify([m.to_dict() for m in movies]), 200


@movies_bp.get("/genres")
def get_genres():
    genres = db.session.query(Movie.genre).distinct().all()
    return jsonify(sorted({g[0] for g in genres})), 200


@movies_bp.get("/<int:movie_id>")
def get_movie(movie_id):
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    return jsonify(movie.to_dict(include_reviews=True)), 200


@movies_bp.post("")
@admin_required
def create_movie():
    data = request.get_json(silent=True) or {}
    errors = _validate_movie_payload(data)
    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    movie = Movie(
        title=data["title"].strip(),
        description=data.get("description", "").strip(),
        genre=data["genre"].strip(),
        release_year=int(data["release_year"]),
        director=data.get("director", "").strip(),
        cast_list=data.get("cast", "").strip(),
        poster_url=data.get("poster_url", "").strip(),
    )
    db.session.add(movie)
    db.session.commit()
    return jsonify(movie.to_dict()), 201


@movies_bp.put("/<int:movie_id>")
@admin_required
def update_movie(movie_id):
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404

    data = request.get_json(silent=True) or {}
    errors = _validate_movie_payload({**movie.to_dict(), **data})
    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    movie.title       = data.get("title", movie.title).strip()
    movie.description = data.get("description", movie.description)
    movie.genre       = data.get("genre", movie.genre).strip()
    movie.release_year= int(data.get("release_year", movie.release_year))
    movie.director    = data.get("director", movie.director)
    movie.cast_list   = data.get("cast", movie.cast_list)
    movie.poster_url  = data.get("poster_url", movie.poster_url)

    db.session.commit()
    return jsonify(movie.to_dict()), 200


@movies_bp.delete("/<int:movie_id>")
@admin_required
def delete_movie(movie_id):
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    db.session.delete(movie)
    db.session.commit()
    return jsonify({"message": "Movie deleted"}), 200
