const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://moviemate-1-28mc.onrender.com/api";

function getToken() {
  return localStorage.getItem("moviemate_token") || "";
}

function setToken(token) {
  if (token) {
    localStorage.setItem("moviemate_token", token);
  }
}

function clearToken() {
  localStorage.removeItem("moviemate_token");
}

async function request(path, options = {}) {
  let res;
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",   // send session cookie with every request
      ...options,
      headers,
    });
  } catch (err) {
    if (err instanceof TypeError || (err.message && err.message.toLowerCase().includes("fetch"))) {
      throw new Error("Failed to connect to backend server. Please ensure the backend server is running.");
    }
    throw err;
  }

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (data && data.token) {
    setToken(data.token);
  }

  return data;
}


export const api = {
  // ── Auth ──────────────────────────────────────────────────
  me:       ()        => request("/auth/me"),
  login:    async (payload) => {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    if (data && data.token) setToken(data.token);
    return data;
  },
  register: async (payload) => {
    const data = await request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    if (data && data.token) setToken(data.token);
    return data;
  },
  logout:   async ()  => {
    clearToken();
    return request("/auth/logout", { method: "POST" });
  },


  // ── Movies ────────────────────────────────────────────────
  getMovies: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/movies${query ? `?${query}` : ""}`);
  },
  getGenres:   ()        => request("/movies/genres"),
  getMovie:    (id)      => request(`/movies/${id}`),
  createMovie: (payload) => request("/movies",     { method: "POST", body: JSON.stringify(payload) }),
  updateMovie: (id, p)   => request(`/movies/${id}`, { method: "PUT",  body: JSON.stringify(p) }),
  deleteMovie: (id)      => request(`/movies/${id}`, { method: "DELETE" }),

  // ── Ratings ───────────────────────────────────────────────
  rateMovie:   (payload) => request("/ratings",      { method: "POST", body: JSON.stringify(payload) }),
  getReviews:  (movieId) => request(`/reviews/movie/${movieId}`),

  // ── Reviews ───────────────────────────────────────────────
  createReview: (payload) => request("/reviews",       { method: "POST", body: JSON.stringify(payload) }),
  updateReview: (id, p)   => request(`/reviews/${id}`, { method: "PUT",  body: JSON.stringify(p) }),
  deleteReview: (id)      => request(`/reviews/${id}`, { method: "DELETE" }),

  // ── Recommendations ───────────────────────────────────────
  getRecommendations: (limit = 8) => request(`/recommendations/me?limit=${limit}`),
  getRelatedMovies:   (movieId)   => request(`/recommendations/related/${movieId}`),

  // ── Admin ─────────────────────────────────────────────────
  adminGetUsers:    ()            => request("/admin/users"),
  adminGetStats:    ()            => request("/admin/stats"),
  adminChangeRole:  (id, role)    => request(`/admin/users/${id}/role`,   { method: "PUT",    body: JSON.stringify({ role }) }),
  adminDeleteUser:  (id)          => request(`/admin/users/${id}`,         { method: "DELETE" }),
};
