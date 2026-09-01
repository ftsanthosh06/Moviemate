import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import BackButton from "../components/BackButton.jsx";


const EMPTY = { title:"", description:"", genre:"", release_year:"", director:"", cast:"", poster_url:"" };

export default function AddMovie() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEditing = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isEditing)
      api.getMovie(id).then((m) => setForm({
        title: m.title||"", description: m.description||"", genre: m.genre||"",
        release_year: m.release_year||"", director: m.director||"",
        cast: m.cast||"", poster_url: m.poster_url||"",
      }));
  }, [id, isEditing]);

  const update = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:undefined})); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.genre.trim()) e.genre = "Genre is required";
    const y = Number(form.release_year);
    if (!form.release_year) e.release_year = "Release year is required";
    else if (!Number.isInteger(y)||y<1888) e.release_year = "Enter a valid year";
    if (form.poster_url && !/^https?:\/\//i.test(form.poster_url)) e.poster_url = "Must start with http://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, release_year: Number(form.release_year) };
      const result  = isEditing ? await api.updateMovie(id, payload) : await api.createMovie(payload);
      navigate(`/movies/${result.id}`);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container" style={{ paddingTop: 20 }}>
      <BackButton to={isEditing ? `/movies/${id}` : "/"} label={isEditing ? "Back to Movie" : "Back to Home"} />
      <div className="section" style={{ paddingTop: 0 }}>

        <div className="section-header"><h2>{isEditing ? "Edit Movie" : "Add a New Movie"}</h2></div>
        <form className="form-card" onSubmit={handleSubmit}>
          {serverError && <div className="alert alert-error">{serverError}</div>}
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Inception" />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Synopsis..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Genre *</label>
              <input value={form.genre} onChange={e=>update("genre",e.target.value)} placeholder="e.g. Sci-Fi" />
              {errors.genre && <div className="field-error">{errors.genre}</div>}
            </div>
            <div className="form-group">
              <label>Release Year *</label>
              <input type="number" value={form.release_year} onChange={e=>update("release_year",e.target.value)} placeholder="e.g. 2010" />
              {errors.release_year && <div className="field-error">{errors.release_year}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Director</label>
              <input value={form.director} onChange={e=>update("director",e.target.value)} placeholder="e.g. Christopher Nolan" />
            </div>
            <div className="form-group">
              <label>Cast</label>
              <input value={form.cast} onChange={e=>update("cast",e.target.value)} placeholder="Comma-separated names" />
            </div>
          </div>
          <div className="form-group">
            <label>Poster URL</label>
            <input value={form.poster_url} onChange={e=>update("poster_url",e.target.value)} placeholder="https://..." />
            {errors.poster_url && <div className="field-error">{errors.poster_url}</div>}
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Add Movie"}
          </button>
        </form>
      </div>
    </main>
  );
}
