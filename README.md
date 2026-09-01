# 🎬 Movie-Mate

A full-stack movie rating and review application. Users can add movies, write reviews,
rate movies on a 1–5 star scale, search and filter the catalog, and get personalized
recommendations.

**Stack:** React (Vite) + HTML/CSS/JS · Python Flask REST API · MySQL

---

## 1. Project Structure

```
Movie-Mate/
├── backend/                # Flask REST API
│   ├── app.py               # App entry point / blueprint registration
│   ├── config.py            # Reads DB credentials from .env
│   ├── extensions.py        # Shared SQLAlchemy instance
│   ├── models/               # SQLAlchemy models (User, Movie, Rating, Review)
│   ├── routes/                # Blueprints: movies, ratings, reviews, recommendations, users
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React (Vite) single-page app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx / App.jsx
│       ├── api/api.js        # fetch wrapper for the Flask API
│       ├── hooks/useCurrentUser.js
│       ├── components/       # Navbar, MovieCard, StarRating, ReviewCard, etc.
│       └── pages/             # Home, MovieDetails, AddMovie, WriteReview
├── database.sql             # MySQL schema + seed data
└── README.md
```

## 2. Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.x running locally (or a reachable MySQL server)

## 3. Database Setup

1. Start MySQL and log in as a user that can create databases:
   ```bash
   mysql -u root -p
   ```
2. Run the provided schema script (creates the `movie_mate` database, tables, and demo data):
   ```bash
   mysql -u root -p < database.sql
   ```

## 4. Backend Setup (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env with your real MySQL username/password

python app.py
```

The API will start at **http://localhost:5000**. Check it's alive:
```bash
curl http://localhost:5000/api/health
```

> Database credentials are never hardcoded — `config.py` reads them from `.env`,
> which is git-ignored. Use `.env.example` as a template.

## 5. Frontend Setup (React + Vite)

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api  (default already works)

npm run dev
```

The app will start at **http://localhost:5173** and proxies `/api` calls to the Flask
backend during development.

To build a production bundle:
```bash
npm run build
```

## 6. Using the App

- The navbar has a **user switcher** (demo users seeded in `database.sql`) so you can
  try rating/reviewing as different users without building a full login system.
- **Home** — search, filter (genre / year / rating), sort, top rated, and a
  "Recommended for You" section.
- **Movie Details** — full info, star rating input, reviews list, related movies.
- **Add Movie** — form to create (or edit) a movie.
- **Write Review** — star rating + review text for a specific movie.

## 7. API Documentation

Base URL: `http://localhost:5000/api`

### Movies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/movies` | List movies. Query params: `q`, `genre`, `year`, `min_rating`, `sort` (`highest_rated`, `lowest_rated`, `newest`, `oldest`, `most_reviewed`) |
| GET | `/movies/genres` | List distinct genres |
| GET | `/movies/:id` | Get one movie (includes reviews) |
| POST | `/movies` | Create a movie |
| PUT | `/movies/:id` | Update a movie |
| DELETE | `/movies/:id` | Delete a movie |

### Ratings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ratings` | Create/update a user's 1–5 rating for a movie (unique per user+movie) |
| GET | `/ratings/movie/:movieId` | All ratings for a movie |
| DELETE | `/ratings/:id` | Delete a rating |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reviews/movie/:movieId` | All reviews for a movie |
| POST | `/reviews` | Create a review |
| PUT | `/reviews/:id` | Edit a review |
| DELETE | `/reviews/:id` | Delete a review |

### Recommendations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/recommendations/:userId?limit=8` | Personalized recommendations |
| GET | `/recommendations/related/:movieId` | Movies related to a given movie (same genre) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List demo users |
| POST | `/users` | Create a user |

All endpoints return JSON. Errors return `{ "error": "message" }` with an appropriate
HTTP status code (400, 404, 409, 500).

## 8. Recommendation Logic

1. Look at genres the current user has rated **4 stars or higher** → "preferred genres".
2. Exclude movies the user has already rated.
3. Score remaining movies: base score = average rating, **+1.5** if the movie's genre is
   a preferred genre, **+0.5** if its average rating is above 4 stars.
4. Return the top-scoring movies (`limit` query param, default 8).
5. New users with no rating history fall back to the highest globally-rated movies.

## 9. Notes

- CORS is enabled on the Flask API so the Vite dev server (port 5173) can call it
  (port 5000) directly.
- A user cannot submit two separate ratings for the same movie — posting a new rating
  updates the existing one (enforced by a unique constraint + upsert logic).
- This is a learning/demo project: the "current user" is chosen via a dropdown instead
  of real authentication, to keep the focus on the CRUD/rating/review/recommendation
  features.
