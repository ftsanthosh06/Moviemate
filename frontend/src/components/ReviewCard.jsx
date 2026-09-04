import React, { useState } from "react";
import StarRating from "./StarRating.jsx";

export default function ReviewCard({ review, currentUserId, isAdmin, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.review_text);
  const [rating, setRating] = useState(review.rating);
  const isOwner = Boolean(currentUserId && review.user_id === currentUserId);


  const save = () => {
    onEdit(review.id, { review_text: text, rating });
    setEditing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
    } catch (_) {
      return "";
    }
  };

  return (
    <div className="review-card">
      <div className="review-head">
        <span className="review-user">{review.username || "Anonymous"}</span>
        <span className="review-date">{formatDate(review.created_at)}</span>
      </div>


      {editing ? (
        <>
          <StarRating value={rating} interactive onRate={setRating} />
          <textarea
            className="review-text"
            style={{
              width: "100%",
              marginTop: 10,
              minHeight: 80,
              background: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-olive)",
              borderRadius: "var(--radius-sm)",
              padding: 12,
              fontFamily: "inherit",
              fontSize: 14,
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="review-actions">
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <StarRating value={review.rating} size={14} />
          <p className="review-text">{review.review_text}</p>
          {(isOwner || isAdmin) && (
            <div className="review-actions">
              <button className="btn btn-edit btn-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-delete btn-sm" onClick={() => onDelete(review.id)}>Delete</button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
