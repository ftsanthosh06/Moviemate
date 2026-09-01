import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "movie-mate:user-id";

/**
 * Tracks the "logged in" user for this simple demo app.
 * Persists the chosen user id in localStorage so it survives a refresh.
 * Defaults to user id 1 (seeded demo user) if nothing is stored yet.
 */
export function useCurrentUser() {
  const [userId, setUserIdState] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : 1;
  });

  const setUserId = useCallback((id) => {
    setUserIdState(id);
    window.localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(STORAGE_KEY, String(userId));
    }
  }, []); // eslint-disable-line

  return { userId, setUserId };
}
