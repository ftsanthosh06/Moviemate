import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="back-btn" onClick={handleClick} type="button" aria-label="Go back">
      <span>{label}</span>
    </button>
  );
}
