from extensions import db


class Movie(db.Model):
    __tablename__ = "movies"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    genre = db.Column(db.String(100), nullable=False, index=True)
    release_year = db.Column(db.Integer, nullable=False, index=True)
    director = db.Column(db.String(150))
    cast_list = db.Column(db.Text)
    poster_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    ratings = db.relationship("Rating", backref="movie", cascade="all, delete-orphan")
    reviews = db.relationship("Review", backref="movie", cascade="all, delete-orphan")

    def average_rating(self):
        if not self.ratings:
            return 0.0
        return round(sum(r.rating for r in self.ratings) / len(self.ratings), 1)

    def rating_count(self):
        return len(self.ratings)

    def to_dict(self, include_reviews=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "genre": self.genre,
            "release_year": self.release_year,
            "director": self.director,
            "cast": self.cast_list,
            "poster_url": self.poster_url,
            "average_rating": self.average_rating(),
            "rating_count": self.rating_count(),
        }
        if include_reviews:
            data["reviews"] = [r.to_dict() for r in self.reviews]
        return data
